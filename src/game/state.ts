import { computed, readonly, ref } from 'vue';
import { wordList, solution } from './words';

function rowState(row: number) {
  const columns = ref(['', '', '', '', ''])
  const checkedColumns = ref<Array<'not_calculated' | 'correct' | 'absent' | 'misplaced'>>([])
  const columnFocused = ref(0)
  const answer = computed(() => {
    const value = columns.value.join('').toUpperCase()
    return {
      value,
      rowFull: value.length === 5,
      valid: wordList.find(({ word }) => word === value)
    }
  })
  return readonly({
    columns,
    columnFocused,
    checkedColumns,
    answer,
    active: (activeRow: number) => activeRow == row && checkedColumns.value.length === 0,
    backspace: () => {
      const index = columnFocused.value
      if(columns.value[index]){
        columns.value[index] = ''
      }else{
        if(index > 0){
          columns.value[index - 1] = ''
          columnFocused.value = index - 1
        }
      }
    },
    setLetter: (value: string) => {
      if(checkedColumns.value.length > 0) return
      if(value.length > 1) value = value[value.length-1]
      const index = columnFocused.value
      columns.value[index] = value
      if(!columns.value[0]) columnFocused.value = 0
      else if(!columns.value[1]) columnFocused.value = 1
      else if(!columns.value[2]) columnFocused.value = 2
      else if(!columns.value[3]) columnFocused.value = 3
      else if(!columns.value[4]) columnFocused.value = 4
    },
    checkAnswer: () => {
      if(checkedColumns.value.length > 0) return
      if (answer.value.valid) {
        if (answer.value.value === solution) {
          console.log('yayy')
          checkedColumns.value = Array.from({length: 5}, () => 'correct')
        } else {
          console.log(`not ${solution}`)
          let solutionLeft = solution
          checkedColumns.value = Array.from({length: 5}, (_, i) => {
            const letter = columns.value[i].toUpperCase()
            if (solution[i] === letter) {
              solutionLeft = solutionLeft.replace(letter, '')
              return 'correct'
            } 
            return 'not_calculated'
          })
          checkedColumns.value = checkedColumns.value.map((c, i) => {
            if(c === 'correct') return c
            const letter = columns.value[i].toUpperCase()
            if (solutionLeft.includes(letter)) {
              solutionLeft = solutionLeft.replace(letter, '')
              return 'misplaced'
            } 
            return 'absent'
          })
          addNewRow()
        }
      }
    },
    focusTo: (column: number) => columnFocused.value = column,
  })
}

const rows = ref([rowState(0)])
const addNewRow = () => rows.value.push(rowState(rows.value.length))

export const game = readonly({
  rows,
  activeRow: computed(() => rows.value[rows.value.length - 1]),
})

document.addEventListener('keyup', event => {
  if (event.code === 'Enter' && !(event.target instanceof HTMLButtonElement)) {
    game.activeRow.checkAnswer()
  }
})