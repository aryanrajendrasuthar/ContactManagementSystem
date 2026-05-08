interface AvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = { sm: 'row-avatar', md: 'card-avatar', lg: 'detail-avatar' };

export default function Avatar({ name, avatarUrl, size = 'md', className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const cls = sizeMap[size] + (className ? ` ${className}` : '');

  return (
    <div className={cls}>
      {avatarUrl ? (
        <img
          src={avatarUrl.startsWith('/uploads') ? `http://localhost:5001${avatarUrl}` : avatarUrl}
          alt={name}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : (
        initials
      )}
    </div>
  );
}
