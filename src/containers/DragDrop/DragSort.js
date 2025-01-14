import React, { useState, forwardRef } from 'react';
import { ReactSortable } from 'react-sortablejs';
import styled from 'styled-components';
import DehazeIcon from '@mui/icons-material/Dehaze';
import classes from './styles.module.css';
import findIndex from 'lodash/findIndex';
import { combinedFieldAtomValues } from './core/manager/atoms';
import {
  useForm,
  useFieldArray,
  useFormContext,
  withFormProvider,
} from './core/manager/FormProvider';
// Sortable.mount(new Swap());
const StyledBlockWrapper = styled.div`
  position: relative;
  background: white;
  padding: 20px;
  margin-bottom: 10px;
  border: 1px solid lightgray;
  border-radius: 4px;
  cursor: move;
  width: 100px;
  &:hover {
    //background: #eeeeee;
  }
`;
const StyledBlockWrapperCon = styled.div`
  position: relative;
  background: white;
  padding: 20px;
  margin-bottom: 10px;
  border: 1px solid lightgray;
  border-radius: 4px;
  cursor: move;
  &:hover {
    //background: #eeeeee;
  }
`;
const sortableOptions = {
  animation: 150,
  fallbackOnBody: true,
  swapThreshold: 0.65,
  ghostClass: 'ghost',
  group: 'shared',
  forceFallback: true,
  swap: true,
  //   handle: '.handle',
  filter: '.handle',
};
export function isUndefined(val) {
  return val === undefined || Number.isNaN(val);
}
function isDeepEqual(obj1, obj2, eq) {
  if ((eq && eq(obj1, obj2)) || obj1 === obj2) return true;

  if (
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object' ||
    obj1 == null ||
    obj2 == null
  ) {
    return false;
  }

  const keysA = Object.keys(obj1).filter(k => !isUndefined(obj1[k]));
  const keysB = Object.keys(obj2).filter(k => !isUndefined(obj2[k]));

  if (keysA.length !== keysB.length) {
    return false;
  }

  let result = true;

  keysA.forEach(key => {
    if (!keysB.includes(key)) {
      result = false;
    }

    if (typeof obj1[key] === 'function' || typeof obj2[key] === 'function') {
      if (obj1[key].toString() !== obj2[key].toString()) {
        result = false;
      }
    }

    if (!isDeepEqual(obj1[key], obj2[key])) {
      result = false;
    }
  });

  return result;
}
const CustomComponent = forwardRef((props, ref) => {
  return (
    <div ref={ref} className={classes.flexDisplay}>
      {props.children}
    </div>
  );
});
function App() {
  const [blocks, setBlocks] = useState([
    {
      id: 1,
      content: 'item 1',
      parent_id: null,
      type: 'container',
      children: [
        {
          id: 2,
          content: 'item 2',
          width: 3,
          type: 'text',
          parent_id: 1,
        },
        {
          id: 3,
          content: 'item 3',
          width: 3,
          type: 'text',
          parent_id: 1,
        },
      ],
    },
    {
      id: 4,
      content: 'item 2',
      parent_id: null,
      type: 'container',
      children: [
        {
          id: 5,
          content: 'item 5',
          width: 3,
          parent_id: 2,
          type: 'container',
          children: [
            {
              id: 8,
              content: 'item 8',
              width: 6,
              type: 'text',
              parent_id: 5,
            },
            {
              id: 9,
              content: 'item 9',
              width: 6,
              type: 'text',
              parent_id: 5,
            },
          ],
        },
        {
          id: 6,
          content: 'item 6',
          width: 2,
          type: 'text',
          parent_id: 2,
          chosen: true,
        },
        {
          id: 7,
          content: 'item 7',
          width: 2,
          type: 'text',
          parent_id: 2,
          chosen: true,
        },
      ],
    },
  ]);
  return (
    <div className={classes.cursor}>
      <ReactSortable
        list={blocks}
        setList={list => {
          setBlocks(list);
        }}
        {...sortableOptions}
      >
        {/* <ReactSortable list={blocks} setList={() => {}} {...sortableOptions}> */}
        {blocks.map((block, blockIndex) => (
          <BlockWrapper
            key={block.id}
            block={block}
            blockIndex={[blockIndex]}
            setBlocks={setBlocks}
          />
        ))}
      </ReactSortable>
    </div>
  );
}
function Container({ block, blockIndex, setBlocks }) {
  return (
    <ReactSortable
      key={block.id}
      list={block.children}
      swap
      multiDrag
      tag={CustomComponent}
      setList={currentList => {
        setBlocks(sourceList => {
          const tempList = [...sourceList];
          const _blockIndex = [...blockIndex];
          const lastIndex = _blockIndex.pop();
          const lastArr = _blockIndex.reduce(
            (arr, i) => arr[i]['children'],
            tempList
          );
          const findI = findIndex(lastArr, entry => {
            return entry.id === block.id;
          });
          if (findI >= 0) {
            lastArr[findI]['children'] = currentList || [];
            return tempList;
          } else {
            lastArr[lastIndex]['children'] = currentList || [];
            return tempList;
          }
        });
      }}
      {...sortableOptions}
    >
      {block.children &&
        block.children.map((childBlock, index) => {
          return (
            <BlockWrapper
              key={childBlock.id}
              block={childBlock}
              blockIndex={[...blockIndex, index]}
              setBlocks={setBlocks}
            />
          );
        })}
    </ReactSortable>
  );
}
function ContainerDD(props) {
  const tableField = useFieldArray({
    fieldNames: props.fields.map(f => f.name),
    name: props.name,
    ancestors: [{ name: props.parentName, rowId: props.block }],
    // validate: (value) =>
    //   value?.length <= 1 ? 'Need at least two rows' : undefined,
  });
  const getValue = tableField.getFieldArrayValue();
  console.log(getValue, [{ name: props.parentName, rowId: props.block }], combinedFieldAtomValues);
  return (
    <ReactSortable
      list={getValue}
      tag={CustomComponent}
      setList={currentList => {
        // tableField.setFieldArrayValue(currentList);
      }}
      {...sortableOptions}
    >
      {tableField.fieldArrayProps.rowIds &&
        tableField.fieldArrayProps.rowIds.map((r, idx) => {
          return (
            <BlockWrapperDD
              key={`r.id_${idx}`}
              block={r}
              blockIndex={[idx]}
              rowId={r}
              getDataRow={tableField.getFieldArrayValueByRowId}
            />
          );
        })}
    </ReactSortable>
  );
}
function BlockWrapper({ block, blockIndex, setBlocks }) {
  if (!block) return null;
  if (block.type === 'container') {
    return (
      <StyledBlockWrapperCon className="block">
        container: {block.content}
        {/* <Container
          block={block}
          setBlocks={setBlocks}
          blockIndex={blockIndex}
        /> */}
      </StyledBlockWrapperCon>
    );
  } else {
    return (
      <StyledBlockWrapper className={classes.cursor}>
        <span className="handle">
          <DehazeIcon />
        </span>
        text: {block.content}
      </StyledBlockWrapper>
    );
  }
}
function BlockWrapperDD({ block, getDataRow }) {
  const data = getDataRow(block);
  if (!data) return null;
  if (data.type === 'container') {
    return (
      <StyledBlockWrapperCon className="block">
        container: {data.content}
        <ContainerDD
          name="children"
          block={block}
          parentName={'items'}
          fields={[
            // {
            //   name: 'item.name',
            //   type: 'text',
            //   // validate: value => (value ? null : 'Missing value'),
            // },
            // { name: 'item.desc', type: 'text' },
            { name: 'id', type: 'number' },
            { name: 'content', type: 'text' },
            { name: 'type', type: 'text' },
            // { name: 'children', type: 'array' },
          ]}
        />
      </StyledBlockWrapperCon>
    );
  } else {
    return (
      <StyledBlockWrapper className={classes.cursor}>
        <span className="handle">
          <DehazeIcon />
        </span>
        text: {data.content}
      </StyledBlockWrapper>
    );
  }
}

function DDContainer(props) {
  const { getFieldArrayValue, fieldArrayProps, getFieldArrayValueByRowId } =
    useFieldArray({
      fieldNames: props.fields.map(f => f.name),
      name: props.name,
      // validate: (value) =>
      //   value?.length <= 1 ? 'Need at least two rows' : undefined,
    });
  const { updateDNDValues } = useFormContext();
  const getValue = getFieldArrayValue();
  return (
    <div className={classes.cursor}>
      <ReactSortable
        list={getValue}
        setList={list => {
          if (list.length && !isDeepEqual(list, getValue)) {
            updateDNDValues({ items: list });
          }
        }}
        {...sortableOptions}
      >
        {/* <ReactSortable list={blocks} setList={() => {}} {...sortableOptions}> */}
        {fieldArrayProps.rowIds.map((r, idx) => {
          return (
            <BlockWrapperDD
              key={`r.id_${idx}`}
              block={r}
              blockIndex={[idx]}
              rowId={r}
              getDataRow={getFieldArrayValueByRowId}
            />
          );
        })}
      </ReactSortable>
    </div>
  );
}

const AppDragDrop = () => {
  function onSubmit(values) {
    console.log(values);
  }
  const { handleSubmit, resetInitialValues, validateFields, getValues } =
    useForm({
      onSubmit,
      initialValues: {
        items: [
          {
            id: 1,
            content: 'item 1',
            parent_id: null,
            type: 'container',
            children: [
              {
                id: 2,
                content: 'item 2',
                width: 3,
                type: 'text',
                parent_id: 1,
              },
              {
                id: 3,
                content: 'item 3',
                width: 3,
                type: 'text',
                parent_id: 1,
              },
            ],
          },
          {
            id: 4,
            content: 'item 2',
            parent_id: null,
            type: 'container',
            children: [
              {
                id: 5,
                content: 'item 5',
                width: 3,
                parent_id: 2,
                type: 'text',
              },
              {
                id: 8,
                content: 'item 8',
                width: 6,
                type: 'text',
                parent_id: 5,
              },
              {
                id: 9,
                content: 'item 9',
                width: 6,
                type: 'text',
                parent_id: 5,
              },
              {
                id: 6,
                content: 'item 6',
                width: 2,
                type: 'text',
                parent_id: 2,
                chosen: true,
              },
              {
                id: 7,
                content: 'item 7',
                width: 2,
                type: 'text',
                parent_id: 2,
                chosen: true,
              },
            ],
          },
        ],
      },
    });
  // const a = getValues()
  console.log(combinedFieldAtomValues)
  return (
    <div className="grid grid-cols-3">
      <form onSubmit={handleSubmit} className="col-span-2">
        <DDContainer
          name="items"
          fields={[
            // {
            //   name: 'item.name',
            //   type: 'text',
            //   // validate: value => (value ? null : 'Missing value'),
            // },
            // { name: 'item.desc', type: 'text' },
            { name: 'id', type: 'number' },
            { name: 'content', type: 'text' },
            { name: 'type', type: 'text' },
            { name: 'children', type: 'array' },
          ]}
        />
        <button type="submit">submit</button>
      </form>
    </div>
  );
};
export default withFormProvider(AppDragDrop);
