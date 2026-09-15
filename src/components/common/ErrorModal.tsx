import { AlertModal } from './AlertModal';

type Props = {
  visible: boolean;
  title?: string;
  description?: string;
  onCancel: () => void;
  onRetry: () => void;
};

export const ErrorModal = ({
  visible,
  title = '일시적인 오류',
  description = '잠시 후 다시 시도해 주세요.',
  onCancel,
  onRetry,
}: Props) => {
  return (
    <AlertModal
      visible={visible}
      title={title}
      description={description}
      cancelText="취소"
      confirmText="재시도"
      onClose={onCancel}
      onConfirm={onRetry}
    />
  );
};
