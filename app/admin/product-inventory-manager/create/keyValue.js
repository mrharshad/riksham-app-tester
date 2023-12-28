const KeyValue = ({
  useState,
  keyData,
  valueData,
  useRef,
  setKeyValueData,
  deleteKeyValue,
  name,
}) => {
  const key = useRef();
  const value = useRef();
  const [updated, setUpdated] = useState(false);

  const manageKeyValue = () => {
    const resp = setKeyValueData(
      key.current.value,
      value.current.value,
      name,
      keyData
    );
    if (!keyData && resp) {
      key.current.value = "";
      value.current.value = "";
    }
    if (resp && keyData) {
      setUpdated(false);
    }
  };
  const dataChange = (e) => {
    const target = e.target;
    function updatedSet(current, old) {
      if (current !== old) {
        if (!updated) {
          setUpdated(true);
        }
      } else {
        if (updated) {
          setUpdated(false);
        }
      }
    }
    if (target.name === "value") {
      updatedSet(target.value.trim(), valueData);
    } else {
      updatedSet(target.value.trim(), keyData);
    }
  };
  return (
    <div>
      <input
        name="key"
        placeholder="type key..."
        onChange={dataChange}
        type="text"
        ref={key}
        defaultValue={keyData}
      />
      <textarea
        placeholder="type value..."
        name="value"
        onChange={dataChange}
        type="text"
        ref={value}
        defaultValue={valueData}
      />
      {updated ? (
        <button type="button" onClick={manageKeyValue}>
          Set Data
        </button>
      ) : null}
      {keyData ? (
        <span onClick={() => deleteKeyValue(keyData, name)}>Delete</span>
      ) : null}
    </div>
  );
};

export default KeyValue;
