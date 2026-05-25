"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { AnnouncementBar } from "@prisma/client";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createOrUpdateAnnouncementBar } from "@/src/app/actions/banner.actions";
import AnnouncementMarquee from "@/src/components/banners/AnnouncementMarquee";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Slider } from "@/src/components/ui/slider";
import { Switch } from "@/src/components/ui/switch";
import { X } from "lucide-react";

const SketchPicker = dynamic(
  () => import("react-color").then((m) => m.SketchPicker),
  { ssr: false }
);

const schema = z.object({
  messages: z.array(z.string().min(1)).min(1),
  bgColor: z.string(),
  textColor: z.string(),
  speed: z.number().min(10).max(60),
  isActive: z.boolean(),
  showFrom: z.string().optional(),
  showUntil: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type AnnouncementBarFormProps = {
  announcementBar: AnnouncementBar | null;
};

export default function AnnouncementBarForm({ announcementBar }: AnnouncementBarFormProps) {
  const router = useRouter();
  const [messageInput, setMessageInput] = useState("");
  const existingMessages = useMemo(() => {
    if (!announcementBar) return [];
    try {
      const parsed = JSON.parse(announcementBar.messages) as unknown;
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch {
      return [];
    }
  }, [announcementBar]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      messages: existingMessages,
      bgColor: announcementBar?.bgColor ?? "#95CFB2",
      textColor: announcementBar?.textColor ?? "#ffffff",
      speed: announcementBar?.speed ?? 30,
      isActive: announcementBar?.isActive ?? false,
      showFrom: announcementBar?.showFrom ? new Date(announcementBar.showFrom).toISOString().slice(0, 16) : "",
      showUntil: announcementBar?.showUntil ? new Date(announcementBar.showUntil).toISOString().slice(0, 16) : "",
    },
  });

  const messages = form.watch("messages") || [];

  const addMessage = () => {
    const trimmed = messageInput.trim();
    if (!trimmed) return;
    const next = [...messages, trimmed];
    form.setValue("messages", next, { shouldValidate: true });
    setMessageInput("");
  };

  const removeMessage = (index: number) => {
    const next = [...messages];
    next.splice(index, 1);
    form.setValue("messages", next, { shouldValidate: true });
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await createOrUpdateAnnouncementBar({
        messages: values.messages,
        bgColor: values.bgColor,
        textColor: values.textColor,
        speed: values.speed,
        isActive: values.isActive,
        showFrom: values.showFrom ? new Date(values.showFrom) : null,
        showUntil: values.showUntil ? new Date(values.showUntil) : null,
      });
      toast.success("Announcement bar saved");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save announcement bar";
      toast.error(message);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField control={form.control} name="messages" render={() => (
            <FormItem>
              <FormLabel>Messages</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message and press Enter"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addMessage();
                        }
                      }}
                    />
                    <Button type="button" variant="secondary" onClick={addMessage}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {messages.map((message, index) => (
                      <span
                        key={`${message}-${index}`}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-sm"
                      >
                        {message}
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => removeMessage(index)}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </FormControl>
            </FormItem>
          )} />

          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="bgColor" render={({ field }) => (
              <FormItem><FormLabel>Background color</FormLabel><FormControl><SketchPicker color={field.value} onChange={(v) => field.onChange(v.hex)} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="textColor" render={({ field }) => (
              <FormItem><FormLabel>Text color</FormLabel><FormControl><SketchPicker color={field.value} onChange={(v) => field.onChange(v.hex)} /></FormControl></FormItem>
            )} />
          </div>

          <FormField control={form.control} name="speed" render={({ field }) => (
            <FormItem>
              <FormLabel>Scroll speed ({field.value}s)</FormLabel>
              <FormControl>
                <Slider min={10} max={60} step={1} value={[field.value]} onValueChange={(value) => field.onChange(value[0])} />
              </FormControl>
            </FormItem>
          )} />

          <FormField control={form.control} name="isActive" render={({ field }) => (
            <FormItem className="flex items-center gap-3"><FormLabel>Active</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
          )} />

          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="showFrom" render={({ field }) => (
              <FormItem><FormLabel>Show from</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="showUntil" render={({ field }) => (
              <FormItem><FormLabel>Show until</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl></FormItem>
            )} />
          </div>

          <Button type="submit">Save announcement bar</Button>
        </form>
      </Form>

      <div>
        <p className="mb-2 text-sm font-semibold">Live preview</p>
        <div style={{ backgroundColor: form.watch("bgColor") }} className="rounded-md">
          <AnnouncementMarquee
            messages={form.watch("messages") || []}
            speed={form.watch("speed")}
            textColor={form.watch("textColor")}
          />
        </div>
      </div>
    </div>
  );
}
