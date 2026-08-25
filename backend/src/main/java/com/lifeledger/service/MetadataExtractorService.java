package com.lifeledger.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class MetadataExtractorService {

    private final Tika tika = new Tika();
    private final AutoDetectParser parser = new AutoDetectParser();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String detectMimeType(byte[] fileBytes, String originalFilename) {
        try {
            return tika.detect(fileBytes, originalFilename);
        } catch (Exception e) {
            log.warn("Tika MIME detection error, falling back: {}", e.getMessage());
            return "application/octet-stream";
        }
    }

    public String extractMetadataAsJson(byte[] fileBytes, String originalFilename) {
        Map<String, Object> metaMap = new HashMap<>();
        metaMap.put("originalFilename", originalFilename);
        metaMap.put("fileSizeBytes", fileBytes.length);

        try (InputStream inputStream = new ByteArrayInputStream(fileBytes)) {
            Metadata metadata = new Metadata();
            if (originalFilename != null) {
                metadata.set(org.apache.tika.metadata.TikaCoreProperties.RESOURCE_NAME_KEY, originalFilename);
            }

            BodyContentHandler handler = new BodyContentHandler(-1); // No character limit
            ParseContext context = new ParseContext();
            parser.parse(inputStream, handler, metadata, context);

            for (String name : metadata.names()) {
                // Filter helpful metadata attributes
                String lower = name.toLowerCase();
                if (lower.contains("title") || lower.contains("author") || lower.contains("created")
                        || lower.contains("date") || lower.contains("pages") || lower.contains("content-type")
                        || lower.contains("producer") || lower.contains("creator")) {
                    metaMap.put(name, metadata.get(name));
                }
            }

            // Excerpt snippet of text if available
            String fullText = handler.toString().trim();
            if (!fullText.isEmpty()) {
                String snippet = fullText.length() > 300 ? fullText.substring(0, 300) + "..." : fullText;
                metaMap.put("textPreview", snippet.replaceAll("\\s+", " "));
            }

            return objectMapper.writeValueAsString(metaMap);
        } catch (Exception e) {
            log.warn("Failed to extract full metadata via Tika for {}: {}", originalFilename, e.getMessage());
            try {
                return objectMapper.writeValueAsString(metaMap);
            } catch (Exception ex) {
                return "{}";
            }
        }
    }
}
