import { useEffect, useState } from 'react';

import { Input, Modal } from '@/components/ui';

type FestivalNicknameModalProps = {
  visible: boolean;
  festivalName: string;
  initialNickname?: string;
  saving?: boolean;
  onSave: (nickname: string) => Promise<void> | void;
  onDismiss: () => void;
};

export function FestivalNicknameModal({
  visible,
  festivalName,
  initialNickname,
  saving,
  onSave,
  onDismiss,
}: FestivalNicknameModalProps) {
  const [nickname, setNickname] = useState(initialNickname ?? '');

  useEffect(() => {
    if (visible) {
      setNickname(initialNickname ?? '');
    }
  }, [visible, initialNickname]);

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      title="Custom nickname"
      description={`Set a label for ${festivalName}. We will surface it in badges, saved lists, and recaps.`}
      primaryAction={{
        label: 'Save nickname',
        onPress: () => onSave(nickname),
        loading: saving,
        disabled: saving,
      }}
      secondaryAction={{
        label: 'Remove',
        onPress: () => onSave(''),
        variant: 'outline',
        disabled: saving,
      }}>
      <Input label="Nickname" value={nickname} onChangeText={setNickname} placeholder="Chaoschella" autoFocus />
    </Modal>
  );
}
