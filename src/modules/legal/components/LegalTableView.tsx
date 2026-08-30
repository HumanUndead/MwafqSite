import type { LegalTable } from '../types/legalContent.types';

interface Props {
  table: LegalTable;
}

export function LegalTableView({ table }: Props) {
  return (
    <div className='mb-4 overflow-x-auto rounded-[8px] border-2 border-[#e5e7f0]'>
      <table className='w-full min-w-135 border-collapse text-[13.5px]'>
        <thead>
          <tr>
            {table.columns.map((column, index) => (
              <th
                key={index}
                className='border-b-2 border-[#e5e7f0] bg-[#f5f8ff] px-4 py-3 text-start font-bold text-[#1e2364]'
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className='border-b border-[#e5e7f0] px-4 py-3 align-top leading-[1.55] text-[#4a4f78] last:border-b-0'
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
