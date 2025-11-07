import { useEffect, useRef, useState } from "react";

type User = {
  id: string;
  name: string;
};

type Props = {
  options: User[];
  value: User | null;
  onChange: (val: User) => void;
  placeholder?: string;
};

export function SearchableDropdown(props: Props) {
  const { options, value, onChange, placeholder } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter options berdasarkan search
  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative", width: 250 }}>
      <input
        type="text"
        placeholder={placeholder}
        value={isOpen ? search : value?.name || ""}
        onClick={() => setIsOpen(true)}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        autoComplete="off"
        style={{ width: "100%", padding: 8 }}
      />

      {isOpen && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            maxHeight: 150,
            overflowY: "auto",
            border: "1px solid #ccc",
            backgroundColor: "#fff",
            margin: 0,
            padding: 0,
            listStyle: "none",
            zIndex: 10,
          }}
        >
          {filteredOptions.length === 0 ? (
            <li style={{ padding: 8, color: "#666" }}>No results found</li>
          ) : (
            filteredOptions.map((opt) => (
              <li
                key={opt.id}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                  setSearch("");
                }}
                style={{
                  padding: 8,
                  cursor: "pointer",
                  backgroundColor: value?.id === opt.id ? "#eee" : "#fff",
                }}
              >
                {opt.name}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

//
// import {Controller, useForm} from "react-hook-form";
// import {SearchableDropdown} from "./components/atomic/dropdown.tsx";
//
// type User = {
//     id: string;
//     name: string;
// };
//
// type FormData = {
//     user: User | null;
// };
//
// const users: User[] = [
//     {id: '1', name: 'Alice'},
//     {id: '2', name: 'Bob'},
//     {id: '3', name: 'Charlie'},
// ];

// export function App() {
//     const {control, handleSubmit} = useForm<FormData>({
//         defaultValues: {user: null},
//     });
//
//     const onSubmit = (data: FormData) => {
//         console.log('Selected user:', data.user);
//     };
//
//     return (
//         <form onSubmit={handleSubmit(onSubmit)}>
//             <Controller
//                 name="user"
//                 control={control}
//                 rules={{required: 'User is required'}}
//                 render={({field, fieldState}) => {
//                     return (
//                         <>
//                             <SearchableDropdown
//                                 options={users}
//                                 value={field.value}
//                                 onChange={field.onChange}
//                                 placeholder="Select a user..."
//                             />
//                             {fieldState.error && <p style={{color: 'red'}}>{fieldState.error.message}</p>}
//                         </>
//                     );
//                 }}
//             />
//             <button type="submit">Submit</button>
//         </form>
//     );
// }
