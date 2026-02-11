'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Optional footer (buttons etc.) — rendered inside DialogFooter */
  footer?: React.ReactNode;
  /** Width class — defaults to max-w-lg */
  className?: string;
}

/**
 * Ready-to-use modal wrapper built on shadcn Dialog.
 *
 * Usage:
 *   <Modal
 *     open={showModal}
 *     onOpenChange={setShowModal}
 *     title="Add Holiday"
 *     footer={<Button onClick={save}>Save</Button>}
 *   >
 *     <form>…</form>
 *   </Modal>
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-w-lg', className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-2">{children}</div>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
