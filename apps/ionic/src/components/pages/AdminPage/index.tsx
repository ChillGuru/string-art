import { zodResolver } from '@hookform/resolvers/zod';
import { IonButton, IonInput, useIonRouter } from '@ionic/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { CodeListItem } from '@/components/Admin/CodeListItem';
import { AuthService } from '@/modules/Auth/service';
import { Code, CodeForm, codeFormSchema } from '@/modules/Codes/models';
import { addCodeMutation, deleteCodeMutation } from '@/modules/Codes/mutations';
import { getAllCodesQuery } from '@/modules/Codes/queries';

import styles from './styles.module.scss';

export function AdminPage() {
  const qClient = useQueryClient();
  const router = useIonRouter();

  const codesQ = useQuery(getAllCodesQuery);
  const addCodeM = useMutation(addCodeMutation);
  const deleteCodeM = useMutation(deleteCodeMutation);

  const codeForm = useForm<CodeForm>({ resolver: zodResolver(codeFormSchema) });

  const onSubmit = codeForm.handleSubmit((data) => {
    console.log('Adding code:', data);
    addCodeM
      .mutateAsync(data)
      .then((newCode) => {
        qClient.setQueryData(getAllCodesQuery.queryKey, (old: Code[]) => [
          ...old,
          newCode,
        ]);
        codeForm.resetField('code');
      })
      .catch(console.log);
  });

  function deleteCode(input: CodeForm) {
    deleteCodeM
      .mutateAsync(input)
      .then((resp) => {
        qClient.setQueryData(getAllCodesQuery.queryKey, (old: Code[]) =>
          old.filter((c) => c.id !== resp.id)
        );
      })
      .catch(console.log);
  }

  return (
    <div className={styles.container}>
      <IonButton
        type='button'
        size='large'
        fill='clear'
        className={styles.logOut}
        onClick={() =>
          AuthService.logOut(() => router.push('/', 'root', 'replace'))
        }
      >
        Выйти
      </IonButton>
      <ul className={styles.list}>
        {codesQ.data?.map((c) => (
          <CodeListItem
            key={c.id}
            code={c}
            handleDelete={() => deleteCode({ code: c.value })}
          />
        ))}
      </ul>
      <form onSubmit={onSubmit} className={styles.form}>
        <IonInput
          label='Новый код'
          labelPlacement='floating'
          type='number'
          {...codeForm.register('code')}
          className={styles.textInput}
        />
        {codeForm.formState.errors.code?.message}
        <IonButton type='submit' size='large'>
          Добавить
        </IonButton>
      </form>
    </div>
  );
}
