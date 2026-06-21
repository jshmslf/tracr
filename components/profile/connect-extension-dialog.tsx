"use client";

import { useState } from "react";
import { toast } from "sonner";
import { faCopy, faPlug } from "@fortawesome/free-solid-svg-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons/icon";
import { generatePairingCode } from "@/app/(dashboard)/profile/extension-actions";

export function ConnectExtensionDialog() {
  const [phrase, setPhrase] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleOpenChange(open: boolean) {
    if (!open) {
      setPhrase(null);
      return;
    }

    setLoading(true);
    try {
      const result = await generatePairingCode();
      setPhrase(result);
    } catch {
      toast.error("Could not generate a pairing phrase.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!phrase) return;
    await navigator.clipboard.writeText(phrase);
    toast.success("Copied to clipboard.");
  }

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <Icon icon={faPlug} />
          Connect a device
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect the Tracr extension</DialogTitle>
          <DialogDescription>
            Enter this phrase in the extension to connect it to your account. It is shown only
            once and expires in 10 minutes.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <p className="text-sm text-muted-foreground">Generating phrase...</p>
        ) : phrase ? (
          <div className="flex flex-col gap-3">
            <p className="rounded-md border border-border bg-secondary p-4 font-mono text-sm leading-relaxed">
              {phrase}
            </p>
            <Button type="button" variant="outline" onClick={handleCopy} className="self-start">
              <Icon icon={faCopy} />
              Copy
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
