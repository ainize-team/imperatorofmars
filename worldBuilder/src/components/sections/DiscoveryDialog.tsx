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

type DiscoveryDialogProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  name: string;
};

export default function DiscoveryDialog({ open, onConfirm, onCancel, name }: DiscoveryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(val) => !val && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>🚀 New Discovery!</DialogTitle>
          <DialogDescription>
            You’ve discovered <strong>{name}</strong>.<br/>
            Would you like to register it as an Story IP asset?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Register</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
