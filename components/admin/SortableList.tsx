"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { ReactNode, CSSProperties } from "react";

export function SortableItem({
  id,
  children,
  className = "",
  handle = true,
  compact = false,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  handle?: boolean;
  compact?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative ${className}`}>
      {handle ? (
        <button
          type="button"
          className={
            compact
              ? "absolute left-0.5 top-0.5 z-10 cursor-grab touch-none rounded border border-border/60 bg-background/90 p-0.5 text-muted shadow-sm hover:text-foreground active:cursor-grabbing"
              : "absolute left-1.5 top-1.5 z-10 cursor-grab touch-none rounded-md border border-border/60 bg-background/90 p-1 text-muted shadow-sm hover:text-foreground active:cursor-grabbing"
          }
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={compact ? 10 : 14} />
        </button>
      ) : (
        <div className="absolute inset-0 cursor-grab touch-none" {...attributes} {...listeners} />
      )}
      {children}
    </div>
  );
}

export function SortableList({
  ids,
  onReorder,
  children,
  strategy = "vertical",
}: {
  ids: string[];
  onReorder: (ids: string[]) => void;
  children: ReactNode;
  strategy?: "vertical" | "grid";
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(ids, oldIndex, newIndex));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={ids}
        strategy={strategy === "grid" ? rectSortingStrategy : verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </DndContext>
  );
}
