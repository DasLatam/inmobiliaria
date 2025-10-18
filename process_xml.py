# process_xml.py
import xml.etree.ElementTree as ET
import json
import re
import os
from html import unescape

def parse_wordpress_xml(xml_file):
    print(f"Procesando archivo: {xml_file}")
    if not os.path.exists(xml_file):
        print(f"Error: El archivo '{xml_file}' no se encuentra en el directorio actual.")
        return []

    try:
        tree = ET.parse(xml_file)
        root = tree.getroot()
    except ET.ParseError as e:
        print(f"Error al parsear el XML: {e}")
        return []

    properties = []
    ns = {
        'wp': 'http://wordpress.org/export/1.2/',
        'content': 'http://purl.org/rss/1.0/modules/content/',
        'excerpt': 'http://wordpress.org/export/1.2/excerpt/'
    }

    channel = root.find('channel')
    if channel is None:
        print("Error: No se encontró el tag <channel> en el XML.")
        return []

    for item in channel.findall('item'):
        post_type = item.find('wp:post_type', ns)
        status = item.find('wp:status', ns)
        
        # Procesar solo 'properties' publicadas
        if post_type is not None and post_type.text == 'properties' and status is not None and status.text == 'publish':
            prop = {}
            prop['id'] = int(item.find('wp:post_id', ns).text)
            prop['title'] = item.find('title').text or ''
            prop['slug'] = item.find('wp:post_name', ns).text or str(prop['id']) # Fallback a ID si no hay slug
            prop['content'] = unescape(item.find('content:encoded', ns).text or '') # Decodificar entidades HTML

            # Extraer Metadatos (custom fields)
            custom_fields = {}
            gallery_urls = []
            featured_image_url = None
            
            for meta in item.findall('wp:postmeta', ns):
                meta_key = meta.find('wp:meta_key', ns).text
                meta_value = meta.find('wp:meta_value', ns).text or ''

                if meta_key == '_thumbnail_id':
                     # Buscar el attachment correspondiente para la imagen destacada
                    attachment_id = meta_value
                    # (Esta parte requiere buscar en todo el XML de nuevo, simplificaremos)
                    # Por ahora, buscaremos la URL en los metadatos de galería o adjuntos si es posible
                    pass # Dejaremos featuredImage para el final

                elif meta_key.startswith('es_property_'):
                    clean_key = meta_key.replace('es_property_', '')
                    # Manejar campos serializados simples (como video)
                    if meta_value.startswith('a:'):
                         # Intentar deserializar, si falla, dejar el string
                         try:
                             # Muy básico, no maneja anidación compleja
                             if 'video_url' in meta_value:
                                 match = re.search(r's:9:"video_url";s:\d+:"(.*?)"', meta_value)
                                 custom_fields[clean_key] = match.group(1) if match else meta_value
                             else:
                                custom_fields[clean_key] = meta_value # Dejar serializado si no es simple
                         except Exception:
                             custom_fields[clean_key] = meta_value
                    else:
                        custom_fields[clean_key] = meta_value

                # Capturar URLs de galería si existen en metadatos (ajustar si la key es diferente)
                if meta_key == 'es_property_gallery' or meta_key == '_es_property_gallery': # Asumiendo posible nombre
                     # WP All Export a veces guarda IDs separados por comas
                     gallery_ids = meta_value.split(',')
                     # (Esta parte requiere buscar attachments por ID, simplificaremos)
                     # Buscaremos URLs directas si están en otro campo
                     pass # Simplificación: la galería la obtendremos de attachments
            
            prop['customFields'] = custom_fields
            
            # Extraer Categorías y Ubicaciones (Taxonomías)
            prop['categories'] = []
            prop['locations'] = []
            for cat in item.findall('category'):
                domain = cat.get('domain')
                nicename = cat.get('nicename')
                if domain == 'es_category':
                    prop['categories'].append(cat.text)
                elif domain in ['es_location', 'ubicacion-zona', 'barrios-costa-esmeralda', 'barrios-gba-sur', 'barrios-en-bariloche', 'barrios-en-caba']:
                     # Limpiar ubicaciones basura
                     loc_text = cat.text
                     if loc_text and not loc_text.startswith(('X5', 'X6', 'W5')) and 'Elija' not in loc_text and 'Elige' not in loc_text and 'Argentina' not in loc_text and 'Provincia de' not in loc_text:
                        prop['locations'].append(loc_text)


            # Buscar Imagen Destacada y Galería entre los attachments del post
            # (Asumiendo que los attachments están asociados en el XML estándar)
            # Esta parte es compleja con el formato XML, vamos a extraerla de forma más simple si está en los metadatos o contenido
            
            # Intento simple de obtener imagen destacada de custom fields si existe
            thumb_id = prop['customFields'].get('_thumbnail_id') 
            # Necesitaríamos buscar el attachment con este ID...
            # Simplificación: Buscar URL en contenido o metadatos si está disponible
            img_match = re.search(r'https?://[^\s]+\.(?:jpg|jpeg|png|gif)', prop['content'])
            prop['featuredImage'] = img_match.group(0) if img_match else None
            # Galería muy simplificada (primeras 5 imágenes encontradas en el contenido)
            prop['gallery'] = re.findall(r'https?://[^\s]+\.(?:jpg|jpeg|png|gif)', prop['content'])[:5]


            # Procesamiento final para PropertyCard
            final_prop = {
                "id": prop['id'],
                "title": prop['title'],
                "slug": prop['slug'],
                "content": prop['content'],
                "featuredImage": prop['featuredImage'],
                "gallery": prop['gallery'],
                 "price": prop['customFields'].get('price'),
                 "bedrooms": prop['customFields'].get('bedrooms'),
                 "bathrooms": prop['customFields'].get('bathrooms'),
                 "area": prop['customFields'].get('area'),
                 "address": prop['customFields'].get('address'),
                 "customFields": prop['customFields'], # Mantenemos todos los campos custom
                 "categories": list(set(prop['categories'])), # Eliminar duplicados
                 "locations": list(set(prop['locations'])) # Eliminar duplicados
            }

            properties.append(final_prop)
            print(f"Propiedad procesada: {prop['id']} - {prop['title'][:30]}...")


    print(f"Procesamiento completo. Total de propiedades encontradas: {len(properties)}")
    return properties

# --- Ejecución Principal ---
if __name__ == "__main__":
    xml_filename = 'mcv-vidalpropiedades.WordPress.2025-10-18.xml' # Asegúrate que este sea el nombre correcto
    output_filename = 'src/data/properties.json' # Guardaremos en src/data

    all_properties = parse_wordpress_xml(xml_filename)

    if all_properties:
        # Asegurarse que el directorio de salida exista
        os.makedirs(os.path.dirname(output_filename), exist_ok=True)
        
        try:
            with open(output_filename, 'w', encoding='utf-8') as f:
                json.dump(all_properties, f, ensure_ascii=False, indent=2)
            print(f"Archivo '{output_filename}' generado exitosamente con {len(all_properties)} propiedades.")
        except IOError as e:
            print(f"Error al escribir el archivo JSON: {e}")
    else:
        print("No se generó el archivo JSON debido a errores previos.")