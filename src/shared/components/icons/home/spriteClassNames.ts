export function getWhySpriteClassName(
  iconKey?: string | null,
  index = 0
): string {
  switch (iconKey) {
    case 'icon-tracking':
      return 'ic-refresh';
    case 'icon-reports':
      return 'ic-listdoc';
    case 'icon-certified':
      return 'ic-shield';
    case 'icon-flexibility':
      return 'ic-briefcase';
    default:
      return (
        ['ic-refresh', 'ic-listdoc', 'ic-shield', 'ic-briefcase'][index] ??
        'ic-refresh'
      );
  }
}
