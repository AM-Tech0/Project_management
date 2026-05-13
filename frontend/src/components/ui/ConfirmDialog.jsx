import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({isOpen,onClose,onConfirm,title,message,confirmLabel='Confirm',danger=false}){
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="py-2">
        <p className="text-[14px] text-slate-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant={danger?'danger':'primary'} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  )
}
