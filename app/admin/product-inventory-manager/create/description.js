const Description = ({
  useState,
  description,
  useRef,
  setDescriptionData,
  deleteDescription,
}) => {
  const value = useRef();
  const [updated, setUpdated] = useState(false);

  const manageDescription = () => {
    const resp = setDescriptionData(value.current.value, description);
    if (!description && resp) {
      value.current.value = "";
    }
    if (resp && description) {
      setUpdated(false);
    }
  };
  const dataChange = (e) => {
    const target = e.target;
    if (target.value.toLowerCase().trim() !== description.toLowerCase()) {
      if (!updated) {
        setUpdated(true);
      }
    } else {
      if (updated) {
        setUpdated(false);
      }
    }
  };

  return (
    <div>
      <textarea
        placeholder="type description..."
        onChange={dataChange}
        type="text"
        ref={value}
        defaultValue={description}
      />
      {description ? (
        <span onClick={() => deleteDescription(description)}>Delete</span>
      ) : null}
      {updated ? (
        <button type="button" onClick={manageDescription}>
          Set Data
        </button>
      ) : null}
    </div>
  );
};

export default Description;
