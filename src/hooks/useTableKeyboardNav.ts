'use client';

import { useRef, useCallback } from 'react';

interface UseTableKeyboardNavOptions {
  numRows: number;
  numCols: number;
}

/**
 * Hook para gestionar la navegación espacial con teclado (flechas) en una tabla editable.
 * Cumple con WCAG 2.2 AA permitiendo recorrer celdas bidimensionales sin trampas de foco.
 */
export function useTableKeyboardNav({ numRows, numCols }: UseTableKeyboardNavOptions) {
  // Mapa de referencias a los elementos input (clave: "fila-columna")
  const cellRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const registerCell = useCallback(
    (row: number, col: number) => (el: HTMLInputElement | null) => {
      const key = `${row}-${col}`;
      if (el) {
        cellRefs.current.set(key, el);
      } else {
        cellRefs.current.delete(key);
      }
    },
    []
  );

  const focusCell = useCallback((row: number, col: number) => {
    const key = `${row}-${col}`;
    const el = cellRefs.current.get(key);
    if (el) {
      el.focus();
      // Opcional: seleccionar el texto para facilitar edición rápida
      el.select();
    }
  }, []);

  const handleKeyDown = useCallback(
    (currentRow: number, currentCol: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      let targetRow = currentRow;
      let targetCol = currentCol;
      let handled = false;

      switch (e.key) {
        case 'ArrowRight':
          if (currentCol < numCols - 1) {
            targetCol = currentCol + 1;
            handled = true;
          }
          break;

        case 'ArrowLeft':
          if (currentCol > 0) {
            targetCol = currentCol - 1;
            handled = true;
          }
          break;

        case 'ArrowDown':
          if (currentRow < numRows - 1) {
            targetRow = currentRow + 1;
            handled = true;
          }
          break;

        case 'ArrowUp':
          if (currentRow > 0) {
            targetRow = currentRow - 1;
            handled = true;
          }
          break;

        case 'Home':
          if (!e.ctrlKey) {
            targetCol = 0;
            handled = true;
          }
          break;

        case 'End':
          if (!e.ctrlKey) {
            targetCol = numCols - 1;
            handled = true;
          }
          break;

        default:
          break;
      }

      if (handled) {
        e.preventDefault();
        focusCell(targetRow, targetCol);
      }
    },
    [numRows, numCols, focusCell]
  );

  return {
    registerCell,
    handleKeyDown,
    focusCell,
  };
}

