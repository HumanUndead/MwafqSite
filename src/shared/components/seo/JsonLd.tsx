interface JsonLdProps {
  data: Record<string, unknown>;
}

/** Renders a JSON-LD `<script>` tag. `data` must come from trusted server content. */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
