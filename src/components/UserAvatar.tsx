'use client';

import { User } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { useState } from 'react';

interface UserAvatarProps {
  user: FirebaseUser | null;
  size?: number;
  className?: string;
}

/**
 * UserAvatar component displays user's profile picture from Google auth
 * Falls back to a user icon if no photo is available or if loading fails
 */
export const UserAvatar = ({ user, size = 20, className = '' }: UserAvatarProps) => {
  const [imageError, setImageError] = useState(false);

  if (!user || !user.photoURL || imageError) {
    return <User size={size} className={className} />;
  }

  return (
    <img
      src={user.photoURL}
      alt={user.displayName || 'Profile'}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
      onError={() => setImageError(true)}
    />
  );
};

