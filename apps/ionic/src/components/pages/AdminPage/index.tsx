import { zodResolver } from '@hookform/resolvers/zod';
import { IonButton, IonInput, useIonRouter } from '@ionic/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Code, CodeInput, codeInputSchema, QuantityInput, quantityInputSchema, Quantity } from 'ui';

import { CodeListItem } from '@/components/pages/AdminPage/CodeListItem';
import { AuthService } from '@/modules/Auth/service';
import { addCodeMutation, deleteCodeMutation } from '@/modules/Codes/mutations';
import { getAllCodesQuery } from '@/modules/Codes/queries';

import styles from './styles.module.scss';

export function AdminPage() {
  const qClient = useQueryClient();
  const router = useIonRouter();

  const codesQ = useQuery(getAllCodesQuery);
  const addCodeM = useMutation(addCodeMutation);
  const deleteCodeM = useMutation(deleteCodeMutation);

  const codeForm = useForm<CodeInput>({
    resolver: zodResolver(codeInputSchema),
  });

  const quantityForm = useForm<QuantityInput>({
      resolver: zodResolver(quantityInputSchema),
  });



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
  /*const quantityCodes = quantityCode.handleSubmit((data) => {
    console.log ('start func')
    let randNum: string;
    let codesAmount: number = +data;
    let arr: string[] = [];
    for (let i = -1; i < codesAmount; i=+1){
      randNum = Math.floor(Math.random() * (99999999-10000000) + 10000000).toString();
      console.log('Random number:', randNum);
      arr.push(randNum);
      data.code = arr[i+1];
      console.log('Adding code:', data);
      addCodeM
        .mutateAsync(data)
        .then((newCode) => {
          qClient.setQueryData(getAllCodesQuery.queryKey, (old: Code[]) => [
            ...old,
            newCode,
          ]);
          quantityCode.resetField('code');
        })
        .catch(console.log);
    }
  });*/
    const quantityCodes = quantityForm.handleSubmit((input: QuantityInput)=>{
      
    })

  function deleteCode(input: CodeInput) {
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
      <form onSubmit={quantityCodes} className={styles.formQuantity}>
        <IonInput
          label='Введите от 1 до 100 кодов для добавления '
          labelPlacement='floating'
          {...quantityForm.register('quantity')}
          type='number'
          min="1"
          max="100"
          />
        
        <IonButton type='submit' className={styles.button}>
          Сгенерировать
        </IonButton>
      </form>
    </div>
  );
}
