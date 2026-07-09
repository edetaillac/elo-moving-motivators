// The store references icons by filename (data, not imports); resolve them to
// built asset URLs via a glob so Vite fingerprints and bundles every icon.
const icons = import.meta.glob<string>('./assets/icons/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});

export function iconUrl(fileName: string): string {
  return icons[`./assets/icons/${fileName}`];
}
