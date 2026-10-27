"""
Exports the scene the vehicle viewer renders, as one GLB.

    blender -b CarroSolar_estudio.blend --python scripts/blender/export-vehicle-scene.py -- \
        CarroSolar_v2.glb public/models/vehicle-scene-v1.glb

Two inputs, each used for what only it has:
- CarroSolar_v2.glb, the team's export of the car: the body with its paint
  baked into one texture (feathers, logos and all), plus the battery pack
  ("Baterias"). The studio file's car paint is a node mix glTF cannot carry,
  so the car always comes from here.
- CarroSolar_estudio.blend, the studio the renders were made in: wheels,
  platform, floor, LED strip, the four lights, both cameras and the
  near-black world. Opened by Blender; never saved.

What it does, and nothing more:
- swaps the studio car for the v2 car, placed exactly where the studio car
  stood (matched on the cabin), and stands the battery pack on the platform
  beside it (in the v2 file it sits below the floor line);
- glTF has no area lights (KHR_lights_punctual is point, spot and sun only),
  so each AREA light is also written as an empty named "Area_<light>" whose
  extras carry what the viewer needs to rebuild it as a RectAreaLight;
- writes the world colour to the scene extras, since glTF has no world;
- drops every other custom property first (asset-library metadata, which
  includes signed download links, must not ship);
- exports everything visible, with the sun as a glTF light, the cameras, and
  intensities in Blender's own units ("COMPAT"), which three.js renders 1:1.
"""

import json
import struct
import sys

import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1 :]
CAR_SOURCE, OUTPUT = argv[0], argv[1]

# Where the battery pack stands: on the platform beside the car's tail, on
# the side Camara_inicial sees, so it is in frame and covers nothing.
BATTERY_CENTER_XY = (-0.8, 1.5)
# Web budget for textures: anything larger is scaled down to this edge.
MAX_TEXTURE = 2048

scene = bpy.context.scene


def world_bbox(objects):
    points = [o.matrix_world @ Vector(corner) for o in objects for corner in o.bound_box]
    lo = Vector((min(p.x for p in points), min(p.y for p in points), min(p.z for p in points)))
    hi = Vector((max(p.x for p in points), max(p.y for p in points), max(p.z for p in points)))
    return lo, hi


def to_gltf(v):
    """Blender Z-up to glTF Y-up, the same swizzle the exporter applies."""
    return [round(v.x, 4), round(v.z, 4), round(-v.y, 4)]


def roots(objects):
    return [o for o in objects if o.parent is None or o.parent not in objects]


# Car: v2 in place of the studio car --------------------------------------
studio_cabin = world_bbox([bpy.data.objects["Carro_cabina"]])[0]
studio_car = bpy.data.objects["Carro"]
for o in [studio_car, *studio_car.children_recursive]:
    bpy.data.objects.remove(o, do_unlink=True)

before = set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=CAR_SOURCE)
imported = set(bpy.data.objects) - before
for o in list(imported):
    if o.name.startswith("Motor") and o.type == "EMPTY" and not o.children:
        imported.discard(o)
        bpy.data.objects.remove(o, do_unlink=True)

# The studio car's materials share names with the v2 ones, so the import
# came in as "Name.001". Hand the names back (the viewer finds parts by
# material name); the studio originals belonged to the car just removed.
for material in list(bpy.data.materials):
    base, dot, suffix = material.name.rpartition(".")
    if dot and suffix.isdigit() and base in bpy.data.materials:
        bpy.data.materials.remove(bpy.data.materials[base])
        material.name = base

pack = next(o for o in imported if o.name.startswith("Baterias"))
pack_objects = {pack, *pack.children_recursive}
car_objects = imported - pack_objects

bpy.context.view_layer.update()
cabin = next(o for o in car_objects if o.name.startswith("Carro_cabina"))
offset = studio_cabin - world_bbox([cabin])[0]
for o in roots(car_objects):
    o.location += offset

platform_top = world_bbox([bpy.data.objects["Plataforma"]])[1].z
bpy.context.view_layer.update()
lo, hi = world_bbox([o for o in pack_objects if o.type == "MESH"])
pack.location += Vector(
    (
        BATTERY_CENTER_XY[0] - (lo.x + hi.x) / 2,
        BATTERY_CENTER_XY[1] - (lo.y + hi.y) / 2,
        platform_top - lo.z,
    )
)
bpy.context.view_layer.update()

# Lights --------------------------------------------------------------------
# Ray visibility is not part of glTF either. The studio's sun has "Glossy"
# off (it lights diffusely and never shows up as a highlight), which the
# viewer must know to render it the same way.
for light in [o for o in scene.objects if o.type == "LIGHT"]:
    light["cdl_glossy"] = bool(light.visible_glossy)

for light in [o for o in scene.objects if o.type == "LIGHT" and o.data.type == "AREA"]:
    data = light.data
    rotation = light.matrix_world.to_3x3()
    marker = bpy.data.objects.new(f"Area_{light.name}", None)
    scene.collection.objects.link(marker)
    marker.location = light.matrix_world.translation
    marker["cdl_area_light"] = True
    marker["power"] = data.energy
    marker["color"] = list(data.color)
    marker["width"] = data.size
    marker["height"] = data.size_y if data.shape in {"RECTANGLE", "ELLIPSE"} else data.size
    # Blender area lights emit along local -Z; the rectangle's width runs
    # along local X. Both are stored in glTF axes.
    marker["direction"] = to_gltf((rotation @ Vector((0, 0, -1))).normalized())
    marker["widthAxis"] = to_gltf((rotation @ Vector((1, 0, 0))).normalized())

# Metadata -------------------------------------------------------------------
for owner in [scene, *bpy.data.objects, *bpy.data.materials, *bpy.data.meshes]:
    if owner.get("cdl_area_light"):
        continue
    for key in list(owner.keys()):
        if not key.startswith("cdl_"):
            del owner[key]

background = scene.world.node_tree.nodes.get("Background")
color = background.inputs["Color"].default_value
strength = background.inputs["Strength"].default_value
scene["cdl_background"] = [color[0] * strength, color[1] * strength, color[2] * strength]

# Textures -------------------------------------------------------------------
for image in bpy.data.images:
    if image.users and image.size[0] > MAX_TEXTURE:
        w, h = image.size
        k = MAX_TEXTURE / max(w, h)
        image.scale(round(w * k), round(h * k))

bpy.ops.export_scene.gltf(
    filepath=OUTPUT,
    export_format="GLB",
    use_visible=True,
    export_apply=True,
    export_lights=True,
    export_cameras=True,
    export_extras=True,
    export_image_format="JPEG",
    export_image_quality=85,
    export_import_convert_lighting_mode="COMPAT",
    export_draco_mesh_compression_enable=True,
    export_yup=True,
)

# The exporter reads a light's strength from its node tree when it has one,
# and the studio's lights are driven by their energy, so the sun's glTF
# intensity is set from the energy here (W/m^2, which COMPAT keeps as is).
suns = {o.data.name: o.data.energy for o in scene.objects if o.type == "LIGHT" and o.data.type == "SUN"}
with open(OUTPUT, "r+b") as handle:
    blob = handle.read()
    json_length = struct.unpack("<I", blob[12:16])[0]
    document = json.loads(blob[20 : 20 + json_length])
    for light in document["extensions"]["KHR_lights_punctual"]["lights"]:
        if light["type"] == "directional" and light["name"] in suns:
            light["intensity"] = suns[light["name"]]
    chunk = json.dumps(document, separators=(",", ":")).encode()
    chunk += b" " * (-len(chunk) % 4)
    rest = blob[20 + json_length :]
    header = struct.pack("<III", 0x46546C67, 2, 12 + 8 + len(chunk) + len(rest))
    handle.seek(0)
    handle.write(header + struct.pack("<II", len(chunk), 0x4E4F534A) + chunk + rest)
    handle.truncate()

lo, hi = world_bbox([o for o in pack_objects if o.type == "MESH"])
print("CDL battery bbox (glTF)", to_gltf(Vector((lo.x, hi.y, lo.z))), to_gltf(Vector((hi.x, lo.y, hi.z))))
lo, hi = world_bbox([o for o in car_objects if o.type == "MESH"])
print("CDL car bbox (glTF)", to_gltf(Vector((lo.x, hi.y, lo.z))), to_gltf(Vector((hi.x, lo.y, hi.z))))
