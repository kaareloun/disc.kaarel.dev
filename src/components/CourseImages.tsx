export function CourseImages({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Course map images">
      {images.map((src) => (
        <li key={src}>
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="pressable block overflow-hidden rounded-xl border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <img
              src={src}
              alt={`Course map of ${name}`}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="h-40 w-auto max-w-full object-cover"
            />
          </a>
        </li>
      ))}
    </ul>
  );
}
