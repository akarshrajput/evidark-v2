"use client";
import React, { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Link as LinkIcon,
  Unlink,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  PaintBucket,
  Eraser,
  Image as ImageIcon,
  Pilcrow,
  Type,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import supabase from "@/lib/supabase";

const TiptapEditor = ({
  content,
  onChange,
  placeholder = "Write something...",
}) => {
  const fileInputRef = useRef(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [fontColor, setFontColor] = useState("#000000");
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isImageUploading, setIsImageUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: {
          HTMLAttributes: {
            class: "rounded-md bg-neutral-800/80 border border-red-500/20 p-4 font-mono text-green-300",
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-6",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-6",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class:
              "border-l-4 border-red-500/50 pl-4 italic bg-red-500/5 py-2 rounded-r-md",
          },
        },
      }),
      Underline.configure({
        HTMLAttributes: {
          class: "underline",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-neutral-300 hover:text-white hover:underline transition-colors",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "left",
      }),
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: "px-1 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
        },
      }),
      TextStyle,
      Color,
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            src: {
              default: null,
              parseHTML: (element) => element.getAttribute("src"),
              renderHTML: (attributes) => ({
                src: attributes.src,
              }),
            },
            alt: {
              default: null,
              parseHTML: (element) => element.getAttribute("alt"),
              renderHTML: (attributes) => ({
                alt: attributes.alt,
              }),
            },
            title: {
              default: null,
              parseHTML: (element) => element.getAttribute("title"),
              renderHTML: (attributes) => ({
                title: attributes.title,
              }),
            },
            width: {
              default: "100%",
              parseHTML: (element) => element.getAttribute("width"),
              renderHTML: (attributes) => ({
                width: attributes.width,
              }),
            },
          };
        },
      }).configure({
        HTMLAttributes: {
          class:
            "rounded-lg border max-w-full cursor-pointer hover:shadow-md transition-shadow",
        },
        inline: false, // Make sure images are block elements
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm prose-invert max-w-none min-h-[300px] focus:outline-none p-6 text-neutral-100 prose-headings:text-red-400 prose-strong:text-red-300 prose-em:text-orange-300 prose-code:text-green-300 prose-code:bg-neutral-800/50 prose-blockquote:border-red-500/50 prose-blockquote:text-neutral-300 prose-a:text-neutral-300 prose-a:no-underline hover:prose-a:text-white hover:prose-a:underline selection:bg-red-500/30",
      },
    },
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
    autofocus: false,
    immediatelyRender: false,
  });

  const setLink = React.useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    setLinkUrl(previousUrl || "");
    setLinkDialogOpen(true);
  }, [editor]);

  const handleLinkConfirm = () => {
    if (!editor) return;
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      // Validate URL
      let finalUrl = linkUrl;
      if (!/^https?:\/\//i.test(linkUrl)) {
        finalUrl = `https://${linkUrl}`;
      }
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: finalUrl })
        .run();
    }
    setLinkDialogOpen(false);
  };

  const addImage = async (event) => {
    const file = event.target.files[0];
    if (!file || !editor) return;

    setIsImageUploading(true);

    try {
      // Generate a unique filename with timestamp
      const timestamp = Date.now();
      const fileExt = file.name.split(".").pop();
      const fileName = `${timestamp}-${Math.random()
        .toString(36)
        .substring(2, 9)}.${fileExt}`;
      const filePath = fileName;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from("story-photos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get public URL (use this method for newer Supabase versions)
      const {
        data: { publicUrl },
      } = supabase.storage.from("story-photos").getPublicUrl(filePath);

      // Insert image into editor with proper attributes
      editor
        .chain()
        .focus()
        .setImage({
          src: publicUrl,
          alt: file.name,
          title: file.name,
          width: "100%",
        })
        .run();

      // Force update the content
      onChange?.(editor.getHTML());
    } catch (error) {
      console.error("Image upload failed:", error);
      // Fallback to local image
      const reader = new FileReader();
      reader.onload = () => {
        editor.commands.setImage({
          src: reader.result,
          width: "100%",
        });
      };
      reader.readAsDataURL(file);
    } finally {
      setIsImageUploading(false);
      event.target.value = null;
    }
  };

  if (!editor) {
    return (
      <div className="border rounded-lg border-red-500/20 bg-gradient-to-br from-neutral-900/50 to-red-950/20 shadow-2xl overflow-hidden min-h-[300px] flex items-center justify-center">
        <div className="animate-pulse text-neutral-300">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg border-red-500/20 bg-gradient-to-br from-neutral-900/50 to-red-950/20 overflow-hidden flex flex-col shadow-2xl backdrop-blur-sm">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 p-4 border-b border-red-500/20 bg-neutral-900/90 backdrop-blur-md">
        {/* History Section */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={false}
                disabled={!editor.can().undo()}
                onClick={() => editor.chain().focus().undo().run()}
                aria-label="Undo"
                className="hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-200"
              >
                <Undo2 className="w-4 h-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={false}
                disabled={!editor.can().redo()}
                onClick={() => editor.chain().focus().redo().run()}
                aria-label="Redo"
                className="hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-200"
              >
                <Redo2 className="w-4 h-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Text Formatting Section */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("bold")}
                onClick={() => editor.chain().focus().toggleBold().run()}
                aria-label="Bold"
                className={`hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-200 ${
                  editor.isActive("bold") ? "bg-red-500/20 border-red-500/40 text-red-400" : ""
                }`}
              >
                <Bold className="w-4 h-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("italic")}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                aria-label="Italic"
                className={`hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-200 ${
                  editor.isActive("italic")
                    ? "bg-red-500/20 border-red-500/40 text-red-400"
                    : ""
                }`}
              >
                <Italic className="w-4 h-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("underline")}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                aria-label="Underline"
                className={`hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-200 ${
                  editor.isActive("underline")
                    ? "bg-red-500/20 border-red-500/40 text-red-400"
                    : ""
                }`}
              >
                <UnderlineIcon className="w-4 h-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Underline</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("strike")}
                onClick={() => editor.chain().focus().toggleStrike().run()}
                aria-label="Strikethrough"
                className={`hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-200 ${
                  editor.isActive("strike")
                    ? "bg-red-500/20 border-red-500/40 text-red-400"
                    : ""
                }`}
              >
                <Strikethrough className="w-4 h-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Strikethrough</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("highlight")}
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                aria-label="Highlight"
                className={`hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-200 ${
                  editor.isActive("highlight")
                    ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400"
                    : ""
                }`}
              >
                <Highlighter className="w-4 h-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Highlight</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Headings & Text Section */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("heading", { level: 1 })}
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                aria-label="Heading 1"
                className={`hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-200 ${
                  editor.isActive("heading", { level: 1 })
                    ? "bg-red-500/20 border-red-500/40 text-red-400"
                    : ""
                }`}
              >
                <Heading1 className="w-4 h-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Heading 1</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("heading", { level: 2 })}
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                aria-label="Heading 2"
                className={`hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-200 ${
                  editor.isActive("heading", { level: 2 })
                    ? "bg-red-500/20 border-red-500/40 text-red-400"
                    : ""
                }`}
              >
                <Heading2 className="w-4 h-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Heading 2</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("heading", { level: 3 })}
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                aria-label="Heading 3"
                className={`hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-200 ${
                  editor.isActive("heading", { level: 3 })
                    ? "bg-red-500/20 border-red-500/40 text-red-400"
                    : ""
                }`}
              >
                <Heading3 className="w-4 h-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Heading 3</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("paragraph")}
                onClick={() => editor.chain().focus().setParagraph().run()}
                aria-label="Paragraph"
                className={`hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-200 ${
                  editor.isActive("paragraph")
                    ? "bg-red-500/20 border-red-500/40 text-red-400"
                    : ""
                }`}
              >
                <Pilcrow className="w-4 h-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Paragraph</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Lists Section */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("bulletList")}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                aria-label="Bullet List"
                className={`hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  editor.isActive("bulletList")
                    ? "bg-gray-200 dark:bg-gray-700"
                    : ""
                }`}
              >
                <List className="w-4 h-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Bullet List</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("orderedList")}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                aria-label="Numbered List"
                className={`hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  editor.isActive("orderedList")
                    ? "bg-gray-200 dark:bg-gray-700"
                    : ""
                }`}
              >
                <ListOrdered className="w-4 h-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Numbered List</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Blocks Section */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("blockquote")}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                aria-label="Blockquote"
                className={`hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  editor.isActive("blockquote")
                    ? "bg-gray-200 dark:bg-gray-700"
                    : ""
                }`}
              >
                <Quote className="w-4 h-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Blockquote</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("codeBlock")}
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                aria-label="Code Block"
                className={`hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  editor.isActive("codeBlock")
                    ? "bg-gray-200 dark:bg-gray-700"
                    : ""
                }`}
              >
                <Code2 className="w-4 h-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Code Block</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Link & Media Section */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("link")}
                onClick={setLink}
                aria-label="Add Link"
                className={`hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  editor.isActive("link") ? "bg-gray-200 dark:bg-gray-700" : ""
                }`}
              >
                <LinkIcon className="w-4 h-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Add Link</TooltipContent>
          </Tooltip>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={addImage}
            style={{ display: "none" }}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Insert Image"
                disabled={isImageUploading}
              >
                {isImageUploading ? (
                  <span className="animate-pulse">Uploading...</span>
                ) : (
                  <ImageIcon className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert Image</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Alignment Section */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: "left" })}
                onClick={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
                aria-label="Align Left"
                className={`hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  editor.isActive({ textAlign: "left" })
                    ? "bg-gray-200 dark:bg-gray-700"
                    : ""
                }`}
              >
                <AlignLeft className="w-4 h-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Align Left</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: "center" })}
                onClick={() =>
                  editor.chain().focus().setTextAlign("center").run()
                }
                aria-label="Align Center"
                className={`hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  editor.isActive({ textAlign: "center" })
                    ? "bg-gray-200 dark:bg-gray-700"
                    : ""
                }`}
              >
                <AlignCenter className="w-4 h-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Align Center</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: "right" })}
                onClick={() =>
                  editor.chain().focus().setTextAlign("right").run()
                }
                aria-label="Align Right"
                className={`hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  editor.isActive({ textAlign: "right" })
                    ? "bg-gray-200 dark:bg-gray-700"
                    : ""
                }`}
              >
                <AlignRight className="w-4 h-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Align Right</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Color Section */}
        <div className="flex items-center gap-1">
          <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="Text Color"
                  >
                    <Type className="w-4 h-4" />
                    {/* <div
                      className="absolute bottom-1 right-1 w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          editor.getAttributes("textStyle").color || "#000000",
                      }}
                    /> */}
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>Text Color</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-auto p-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="text-color">Text Color</Label>
                <Input
                  id="text-color"
                  type="color"
                  value={editor.getAttributes("textStyle").color || "#000000"}
                  onChange={(e) => {
                    setFontColor(e.target.value);
                    editor.chain().focus().setColor(e.target.value).run();
                  }}
                  className="w-10 h-10 p-0 border-none"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    editor.chain().focus().unsetColor().run();
                    setColorPickerOpen(false);
                  }}
                >
                  <Eraser className="w-4 h-4 mr-2" />
                  Reset Color
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  editor.chain().focus().toggleHighlight().run();
                }}
                aria-label="Highlight Color"
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Palette className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Highlight Color</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Clear Formatting */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                editor.chain().focus().clearNodes().unsetAllMarks().run()
              }
              aria-label="Clear Formatting"
              className="hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-200 text-red-400"
            >
              <Eraser className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear Formatting</TooltipContent>
        </Tooltip>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto max-h-[500px] bg-gradient-to-b from-neutral-900/80 to-neutral-950/90">
        <EditorContent
          editor={editor}
          className="rounded-b-lg bg-transparent min-h-[300px] text-neutral-100"
        />
      </div>
      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xs">
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input
                id="link"
                className="rounded-xs"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLinkConfirm();
                }}
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="px-3"
              onClick={handleLinkConfirm}
            >
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TiptapEditor;
