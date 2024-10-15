"use client";
import { useState } from "react";
import Image from "next/image";

// Clase que maneja la lógica para procesar JSON
class JSONProcessor {
  procesar(json) {
    console.log("Procesando JSON:", json);
  }
}

// Clase que representa el XML Parser (el sistema legado que recibe XML)
class XMLParser {
  parseXML(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    return xmlDoc;
  }
}

// Adaptador que convierte de XML a JSON
class XMLtoJSONAdapter {
  constructor(xmlParser) {
    this.xmlParser = xmlParser;
  }

  // Convertimos la estructura XML a un objeto JSON
  convert(xmlString) {
    const xmlDoc = this.xmlParser.parseXML(xmlString);
    const json = this.xmlToJson(xmlDoc.documentElement); // Convertimos desde la raíz del XML
    return json;
  }

  // Función recursiva que convierte XML a JSON
  xmlToJson(xml) {
    let obj = {};

    if (xml.nodeType === 1) {
      // Si es un elemento
      if (xml.attributes.length > 0) {
        obj["@attributes"] = {};
        for (let j = 0; j < xml.attributes.length; j++) {
          const attribute = xml.attributes.item(j);
          obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
        }
      }
    } else if (xml.nodeType === 3) {
      // Si es un nodo de texto
      return xml.nodeValue.trim(); // Devolvemos el valor de texto directamente
    }

    if (xml.hasChildNodes()) {
      for (let i = 0; i < xml.childNodes.length; i++) {
        const item = xml.childNodes.item(i);
        const nodeName = item.nodeName;

        if (item.nodeType === 3) {
          // Si el nodo es texto
          const content = this.xmlToJson(item);
          if (content) {
            return content; // Si hay contenido de texto, devolvemos el texto directamente
          }
        } else {
          // Si no es texto, tratamos el nodo como un elemento
          if (!obj[nodeName]) {
            obj[nodeName] = this.xmlToJson(item);
          } else {
            if (!Array.isArray(obj[nodeName])) {
              obj[nodeName] = [obj[nodeName]];
            }
            obj[nodeName].push(this.xmlToJson(item));
          }
        }
      }
    }

    return obj;
  }
}

export default function Home() {
  const [xmlInput, setXmlInput] = useState("<xml></xml>");
  const [jsonOutput, setJsonOutput] = useState("");

  // Creamos una instancia del parser XML y el adaptador
  const xmlParser = new XMLParser();
  const adapter = new XMLtoJSONAdapter(xmlParser);
  const jsonProcessor = new JSONProcessor();

  // Manejador de cambios en el textarea de XML
  const handleXmlChange = (e) => {
    const xml = e.target.value;
    setXmlInput(xml);

    try {
      const json = adapter.convert(xml); // Convertimos XML a JSON
      setJsonOutput(JSON.stringify(json, null, 2)); // Formateamos el JSON con 2 espacios
      jsonProcessor.procesar(json); // Procesamos el JSON
    } catch (error) {
      setJsonOutput("Error al convertir XML a JSON: " + error.message);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col  items-center justify-center bg-gray-900 text-white">
      <div className="  bg-gray-800 font-mono font-light border border-gray-600 rounded-md p-2">
        Samuel Hiram Castro Martinez, patrones de diseño de software
        <div>Patrón Adapter</div>
      </div>

      <div className="w-full  flex flex-row max-md:flex-wrap gap-2 items-center justify-center bg-gray-900 text-white">
        <div className="flex flex-col w-full lg:w-1/2 p-4 gap-2">
          <label className="text-lg font-semibold">Entrada XML</label>
          <textarea
            value={xmlInput}
            onChange={handleXmlChange}
            className="min-h-[80vh] p-2 font-mono border-2 border-gray-700 bg-gray-800 text-white rounded-md shadow-md focus:outline-none focus:ring focus:ring-blue-500"
            placeholder="Introduce tu XML aquí..."
          />
        </div>

        <div className="flex flex-col w-full lg:w-1/2 p-4 gap-2">
          <label className="text-lg font-semibold">Salida JSON</label>
          <textarea
            readOnly
            value={jsonOutput}
            className="min-h-[80vh] p-2 font-mono border-2 border-gray-700 bg-gray-800 text-white rounded-md shadow-md focus:outline-none"
            placeholder="Aquí aparecerá el JSON..."
          />
        </div>
      </div>
    </div>
  );
}
