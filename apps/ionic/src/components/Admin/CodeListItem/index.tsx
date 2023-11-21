import { Code } from '@/modules/Codes/models';

type Props = {
  code: Code;
};

export function CodeListItem({ code }: Props) {
  return (
    <li>
      Код: {code.value} | Использований: {code.timesUsed}
    </li>
  );
}
