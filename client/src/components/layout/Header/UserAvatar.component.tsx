"use client";

import Image from "next/image";

interface UserAvatarProps {
  name: string;
  imageUrl?: string;
}

export function UserAvatar({ name, imageUrl }: UserAvatarProps) {
  const initial = name.charAt(0).toUpperCase();

  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        width={36}
        height={36}
        className="w-9 h-9 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-sm">
      {initial}
    </div>
  );
}
