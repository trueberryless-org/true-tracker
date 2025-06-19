import { cn } from "@/lib/utils";

interface ThemeDiamond {
  title: string;
  color?:
    | "current"
    | "default"
    | "palette"
    | "sapphire"
    | "ruby"
    | "emerald"
    | "coral"
    | "amber"
    | "amethyst"
    | "daylight"
    | "midnight";
  hover?: boolean;
}

export function ThemeDiamond({ title, color }: ThemeDiamond) {
  switch (color) {
    case "current":
      return (
        <div className="h-6 w-6 overflow-hidden rounded-sm">
          <div className="grid h-12 w-12 -translate-x-1/4 -translate-y-1/4 grid-cols-2 overflow-hidden rounded-md transition-all ease-in-out rotate-45">
            <div className="flex h-6 w-6 bg-[--color-1]" />
            <div className="flex h-6 w-6 bg-[--color-3]" />
            <div className="flex h-6 w-6 bg-[--color-2]" />
            <div className="flex h-6 w-6 bg-[--color-4]" />
            <div className="sr-only">{title}</div>
          </div>
        </div>
      );
    case "default":
      return (
        <div className="h-6 w-6 overflow-hidden rounded-sm">
          <div className="grid h-12 w-12 -translate-x-1/4 -translate-y-1/4 grid-cols-2 overflow-hidden rounded-md transition-all ease-in-out rotate-0 group-hover:rotate-45">
            <div className="flex h-6 w-6 bg-[--color-1-default]" />
            <div className="flex h-6 w-6 bg-[--color-3-default]" />
            <div className="flex h-6 w-6 bg-[--color-2-default]" />
            <div className="flex h-6 w-6 bg-[--color-4-default]" />
            <div className="sr-only">{title}</div>
          </div>
        </div>
      );
    case "palette":
      return (
        <div className="h-6 w-6 overflow-hidden rounded-sm">
          <div className="grid h-12 w-12 -translate-x-1/4 -translate-y-1/4 grid-cols-2 overflow-hidden rounded-md transition-all ease-in-out rotate-0 group-hover:rotate-45">
            <div className="flex h-6 w-6 bg-[--color-1-palette]" />
            <div className="flex h-6 w-6 bg-[--color-3-palette]" />
            <div className="flex h-6 w-6 bg-[--color-2-palette]" />
            <div className="flex h-6 w-6 bg-[--color-4-palette]" />
            <div className="sr-only">{title}</div>
          </div>
        </div>
      );
    case "sapphire":
      return (
        <div className="h-6 w-6 overflow-hidden rounded-sm">
          <div className="grid h-12 w-12 -translate-x-1/4 -translate-y-1/4 grid-cols-2 overflow-hidden rounded-md transition-all ease-in-out rotate-0 group-hover:rotate-45">
            <div className="flex h-6 w-6 bg-[--color-1-sapphire]" />
            <div className="flex h-6 w-6 bg-[--color-3-sapphire]" />
            <div className="flex h-6 w-6 bg-[--color-2-sapphire]" />
            <div className="flex h-6 w-6 bg-[--color-4-sapphire]" />
            <div className="sr-only">{title}</div>
          </div>
        </div>
      );
    case "ruby":
      return (
        <div className="h-6 w-6 overflow-hidden rounded-sm">
          <div className="grid h-12 w-12 -translate-x-1/4 -translate-y-1/4 grid-cols-2 overflow-hidden rounded-md transition-all ease-in-out rotate-0 group-hover:rotate-45">
            <div className="flex h-6 w-6 bg-[--color-1-ruby]" />
            <div className="flex h-6 w-6 bg-[--color-3-ruby]" />
            <div className="flex h-6 w-6 bg-[--color-2-ruby]" />
            <div className="flex h-6 w-6 bg-[--color-4-ruby]" />
            <div className="sr-only">{title}</div>
          </div>
        </div>
      );
    case "emerald":
      return (
        <div className="h-6 w-6 overflow-hidden rounded-sm">
          <div className="grid h-12 w-12 -translate-x-1/4 -translate-y-1/4 grid-cols-2 overflow-hidden rounded-md transition-all ease-in-out rotate-0 group-hover:rotate-45">
            <div className="flex h-6 w-6 bg-[--color-1-emerald]" />
            <div className="flex h-6 w-6 bg-[--color-3-emerald]" />
            <div className="flex h-6 w-6 bg-[--color-2-emerald]" />
            <div className="flex h-6 w-6 bg-[--color-4-emerald]" />
            <div className="sr-only">{title}</div>
          </div>
        </div>
      );
    case "coral":
      return (
        <div className="h-6 w-6 overflow-hidden rounded-sm">
          <div className="grid h-12 w-12 -translate-x-1/4 -translate-y-1/4 grid-cols-2 overflow-hidden rounded-md transition-all ease-in-out rotate-0 group-hover:rotate-45">
            <div className="flex h-6 w-6 bg-[--color-1-coral]" />
            <div className="flex h-6 w-6 bg-[--color-3-coral]" />
            <div className="flex h-6 w-6 bg-[--color-2-coral]" />
            <div className="flex h-6 w-6 bg-[--color-4-coral]" />
            <div className="sr-only">{title}</div>
          </div>
        </div>
      );
    case "amber":
      return (
        <div className="h-6 w-6 overflow-hidden rounded-sm">
          <div className="grid h-12 w-12 -translate-x-1/4 -translate-y-1/4 grid-cols-2 overflow-hidden rounded-md transition-all ease-in-out rotate-0 group-hover:rotate-45">
            <div className="flex h-6 w-6 bg-[--color-1-amber]" />
            <div className="flex h-6 w-6 bg-[--color-3-amber]" />
            <div className="flex h-6 w-6 bg-[--color-2-amber]" />
            <div className="flex h-6 w-6 bg-[--color-4-amber]" />
            <div className="sr-only">{title}</div>
          </div>
        </div>
      );
    case "amethyst":
      return (
        <div className="h-6 w-6 overflow-hidden rounded-sm">
          <div className="grid h-12 w-12 -translate-x-1/4 -translate-y-1/4 grid-cols-2 overflow-hidden rounded-md transition-all ease-in-out rotate-0 group-hover:rotate-45">
            <div className="flex h-6 w-6 bg-[--color-1-amethyst]" />
            <div className="flex h-6 w-6 bg-[--color-3-amethyst]" />
            <div className="flex h-6 w-6 bg-[--color-2-amethyst]" />
            <div className="flex h-6 w-6 bg-[--color-4-amethyst]" />
            <div className="sr-only">{title}</div>
          </div>
        </div>
      );
    case "daylight":
      return (
        <div className="h-6 w-6 overflow-hidden rounded-sm">
          <div className="grid h-12 w-12 -translate-x-1/4 -translate-y-1/4 grid-cols-2 overflow-hidden rounded-md transition-all ease-in-out rotate-0 group-hover:rotate-45">
            <div className="flex h-6 w-6 bg-[--color-1-daylight]" />
            <div className="flex h-6 w-6 bg-[--color-3-daylight]" />
            <div className="flex h-6 w-6 bg-[--color-2-daylight]" />
            <div className="flex h-6 w-6 bg-[--color-4-daylight]" />
            <div className="sr-only">{title}</div>
          </div>
        </div>
      );
    case "midnight":
      return (
        <div className="h-6 w-6 overflow-hidden rounded-sm">
          <div className="grid h-12 w-12 -translate-x-1/4 -translate-y-1/4 grid-cols-2 overflow-hidden rounded-md transition-all ease-in-out rotate-0 group-hover:rotate-45">
            <div className="flex h-6 w-6 bg-[--color-1-midnight]" />
            <div className="flex h-6 w-6 bg-[--color-3-midnight]" />
            <div className="flex h-6 w-6 bg-[--color-2-midnight]" />
            <div className="flex h-6 w-6 bg-[--color-4-midnight]" />
            <div className="sr-only">{title}</div>
          </div>
        </div>
      );
  }
}
