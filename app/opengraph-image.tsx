import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

/**
 * Social card for every page that does not define its own: the isotipo, the
 * lockup type in Sansation and the institutional line, on Morado profundo
 * 300 with the brand halo. Built from the brand files at request time, so it
 * never drifts from the mark.
 */
export const alt = 'Candelaria Solar Car, semillero de investigación de la Universidad de los Andes';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  const dir = join(process.cwd(), 'assets/og');
  const [bold, regular, mark] = await Promise.all([
    readFile(join(dir, 'Sansation-Bold.ttf')),
    readFile(join(dir, 'Sansation-Regular.ttf')),
    readFile(join(dir, 'isotipo.png')),
  ]);
  const markSrc = `data:image/png;base64,${mark.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background:
            'radial-gradient(70% 80% at 50% 0%, #3E1057 0%, rgba(30,10,41,0) 70%), #1E0A29',
          color: '#EFEEEA',
          fontFamily: 'Sansation',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <img src={markSrc} width={200} height={200} alt="" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 112, fontWeight: 700, lineHeight: 1 }}>CANDELARIA</div>
            <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1, color: '#FFB938' }}>SOLAR CAR</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ height: 2, width: '100%', background: 'rgba(239,238,234,0.18)', display: 'flex' }}>
            <div style={{ height: 2, width: '38%', background: '#FFB938' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 32, fontWeight: 400 }}>
            <span>Energía que no se detiene</span>
            <span style={{ color: 'rgba(239,238,234,0.72)' }}>Universidad de los Andes</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Sansation', data: bold, style: 'normal', weight: 700 },
        { name: 'Sansation', data: regular, style: 'normal', weight: 400 },
      ],
    },
  );
}
