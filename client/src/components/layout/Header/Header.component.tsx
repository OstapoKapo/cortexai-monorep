"use client";
import { SearchInput } from "./SearchInput.component";
import { UserAvatar } from "./UserAvatar.component";
import { NotificationButton } from "./NotificationButton.component";

export function Header() {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <SearchInput />
      </div>
      <div className="flex items-center gap-4">
        <NotificationButton count={1} />
        <UserAvatar name="Admin" />
      </div>
    </header>
  );
}
