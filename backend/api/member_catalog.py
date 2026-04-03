import unicodedata


CAREER_OPTIONS = [
    {'key': 'business_administration', 'en': 'Business Administration', 'es': 'Administración de Empresas'},
    {'key': 'anthropology', 'en': 'Anthropology', 'es': 'Antropología'},
    {'key': 'architecture', 'en': 'Architecture', 'es': 'Arquitectura'},
    {'key': 'art', 'en': 'Art', 'es': 'Arte'},
    {'key': 'biology', 'en': 'Biology', 'es': 'Biología'},
    {'key': 'data_science', 'en': 'Data Science', 'es': 'Ciencia de Datos'},
    {'key': 'political_science', 'en': 'Political Science', 'es': 'Ciencia Política'},
    {'key': 'law', 'en': 'Law', 'es': 'Derecho'},
    {'key': 'design', 'en': 'Design', 'es': 'Diseño'},
    {'key': 'economics', 'en': 'Economics', 'es': 'Economía'},
    {'key': 'global_studies', 'en': 'Global Studies', 'es': 'Estudios Globales'},
    {'key': 'philosophy', 'en': 'Philosophy', 'es': 'Filosofía'},
    {'key': 'physics', 'en': 'Physics', 'es': 'Física'},
    {'key': 'geosciences', 'en': 'Geosciences', 'es': 'Geociencias'},
    {'key': 'history', 'en': 'History', 'es': 'Historia'},
    {'key': 'art_history', 'en': 'Art History', 'es': 'Historia del Arte'},
    {'key': 'environmental_engineering', 'en': 'Environmental Engineering', 'es': 'Ingeniería Ambiental'},
    {'key': 'biomedical_engineering', 'en': 'Biomedical Engineering', 'es': 'Ingeniería Biomédica'},
    {'key': 'civil_engineering', 'en': 'Civil Engineering', 'es': 'Ingeniería Civil'},
    {
        'key': 'systems_and_computer_engineering',
        'en': 'Systems and Computer Engineering',
        'es': 'Ingeniería de Sistemas y Computación',
    },
    {'key': 'electrical_engineering', 'en': 'Electrical Engineering', 'es': 'Ingeniería Eléctrica'},
    {'key': 'electronic_engineering', 'en': 'Electronic Engineering', 'es': 'Ingeniería Electrónica'},
    {'key': 'industrial_engineering', 'en': 'Industrial Engineering', 'es': 'Ingeniería Industrial'},
    {'key': 'mechanical_engineering', 'en': 'Mechanical Engineering', 'es': 'Ingeniería Mecánica'},
    {'key': 'chemical_engineering', 'en': 'Chemical Engineering', 'es': 'Ingeniería Química'},
    {'key': 'languages_and_culture', 'en': 'Languages and Culture', 'es': 'Lenguas y Cultura'},
    {'key': 'bachelor_of_arts', 'en': 'Bachelor of Arts', 'es': 'Licenciatura en Artes'},
    {'key': 'bachelor_of_biology', 'en': 'Bachelor of Biology', 'es': 'Licenciatura en Biología'},
    {
        'key': 'bachelor_of_early_childhood_education',
        'en': 'Bachelor of Early Childhood Education',
        'es': 'Licenciatura en Educación Infantil',
    },
    {
        'key': 'bachelor_of_spanish_and_philology',
        'en': 'Bachelor of Spanish and Philology',
        'es': 'Licenciatura en Español y Filología',
    },
    {'key': 'bachelor_of_philosophy', 'en': 'Bachelor of Philosophy', 'es': 'Licenciatura en Filosofía'},
    {'key': 'bachelor_of_physics', 'en': 'Bachelor of Physics', 'es': 'Licenciatura en Física'},
    {'key': 'bachelor_of_history', 'en': 'Bachelor of History', 'es': 'Licenciatura en Historia'},
    {'key': 'bachelor_of_mathematics', 'en': 'Bachelor of Mathematics', 'es': 'Licenciatura en Matemáticas'},
    {'key': 'bachelor_of_chemistry', 'en': 'Bachelor of Chemistry', 'es': 'Licenciatura en Química'},
    {'key': 'literature', 'en': 'Literature', 'es': 'Literatura'},
    {'key': 'mathematics', 'en': 'Mathematics', 'es': 'Matemáticas'},
    {'key': 'medicine', 'en': 'Medicine', 'es': 'Medicina'},
    {'key': 'microbiology', 'en': 'Microbiology', 'es': 'Microbiología'},
    {'key': 'music', 'en': 'Music', 'es': 'Música'},
    {'key': 'digital_narratives', 'en': 'Digital Narratives', 'es': 'Narrativas Digitales'},
    {'key': 'psychology', 'en': 'Psychology', 'es': 'Psicología'},
    {'key': 'chemistry', 'en': 'Chemistry', 'es': 'Química'},
]

CAREERS_BY_KEY = {item['key']: item for item in CAREER_OPTIONS}

ROLE_TRANSLATIONS = {
    'leader': 'Líder',
    'team leader': 'Líder de Equipo',
    'member': 'Miembro',
    'coordinator': 'Coordinador',
    'director': 'Director',
    'manager': 'Gerente',
    'engineer': 'Ingeniero',
    'designer': 'Diseñador',
    'developer': 'Desarrollador',
    'researcher': 'Investigador',
    'analyst': 'Analista',
    'mentor': 'Mentor',
    'intern': 'Practicante',
    'assistant': 'Asistente',
}


def _normalize_text(value):
    value = (value or '').strip().lower()
    return ''.join(ch for ch in unicodedata.normalize('NFD', value) if unicodedata.category(ch) != 'Mn')


ROLE_TRANSLATIONS_ES_TO_EN = {
    _normalize_text(es): en
    for en, es in ROLE_TRANSLATIONS.items()
}


def get_career_pair(career_key):
    return CAREERS_BY_KEY.get(career_key)


def resolve_career_pair_from_text(career_text):
    normalized = _normalize_text(career_text)
    if not normalized:
        return None

    for item in CAREER_OPTIONS:
        if _normalize_text(item['en']) == normalized or _normalize_text(item['es']) == normalized:
            return item
    return None


def resolve_role_pair(role_text, source_language):
    role_clean = (role_text or '').strip()
    if not role_clean:
        return {'role_en': '', 'role_es': ''}

    source_language = (source_language or 'en').lower()
    role_lookup = _normalize_text(role_clean)

    if source_language == 'es':
        role_en = ROLE_TRANSLATIONS_ES_TO_EN.get(role_lookup)
        if role_en:
            return {'role_en': role_en.title(), 'role_es': role_clean}
        return {'role_en': role_clean, 'role_es': role_clean}

    role_es = ROLE_TRANSLATIONS.get(role_lookup)
    if role_es:
        return {'role_en': role_clean, 'role_es': role_es}
    return {'role_en': role_clean, 'role_es': role_clean}