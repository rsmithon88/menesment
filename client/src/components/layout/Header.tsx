import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { SidebarContent } from "./Sidebar";

export function Header() {
  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-ml-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 bg-sidebar border-r border-sidebar-border">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">Main navigation sidebar</SheetDescription>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden md:flex items-center max-w-sm w-full relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="অনুসন্ধান করুন..."
          className="pl-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background transition-all"
        />
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-destructive rounded-full border-2 border-background" />
        </Button>
        
        <div className="flex items-center gap-3 pl-4 border-l">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium">আব্দুল্লাহ আল মামুন</span>
            <span className="text-xs text-muted-foreground">অ্যাডমিন</span>
          </div>
          <Avatar className="h-8 w-8 border-2 border-primary/10">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>AM</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
