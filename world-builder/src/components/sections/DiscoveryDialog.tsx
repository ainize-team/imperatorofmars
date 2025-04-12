"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { DEFAULT_NFT_METADATA } from "@/lib/constants";

type DiscoveryDialogProps = {
  open: boolean;
  onConfirm: (data: { imageUrl: string; name: string; description: string }) => void;
  onCancel: () => void;
};

export default function DiscoveryDialog({ open, onConfirm, onCancel }: DiscoveryDialogProps) {
  const [imageUrl, setImageUrl] = useState(DEFAULT_NFT_METADATA.image);
  const [name, setName] = useState(DEFAULT_NFT_METADATA.name);
  const [description, setDescription] = useState(DEFAULT_NFT_METADATA.description);

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>🚀 New Discovery!</DialogTitle>
          <DialogDescription>
            You’ve discovered <strong>KryptoPlanet</strong>.<br />
            Would you like to register it as a Story IP asset?
          </DialogDescription>
        </DialogHeader>
        <Input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Image URL"
        />
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="IP Name" />
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="IP Description"
        />
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm({ imageUrl, name, description })}>Register</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
