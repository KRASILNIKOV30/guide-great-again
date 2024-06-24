import React, {RefObject, useEffect, useRef, useState} from 'react'

type SelectorProps = {
    title: string,
    onChange: (speed: number) => void,
    defaultValue: number,
}

function Selector({
    onChange,
    title,
    defaultValue,
}: SelectorProps) {
    const ref = useRef(null)
    const {value} = useSelect(ref, defaultValue)

    useEffect(() => {
        onChange(value)
    }, [value]);

    return (
        <div className="selector__container">
            <h1 className="selector__header">{title}</h1>
            <select value={value} ref={ref} onChange={() => {}}>
                <option value={0}>Не проходимо</option>
                <option value={5}>Тяжело проходимо</option>
                <option value={10}>Проходимо</option>
                <option value={20}>Предпочтительно</option>
            </select>
        </div>
    )
}

const useSelect = (ref: RefObject<HTMLSelectElement|null>, defaultValue: number) =>  {
    const [value, setValue] = useState(defaultValue)
    const onChange = () => {
        if (ref?.current) {
            setValue(ref.current.value as unknown as number)
        }
    }

    useEffect(  () => {
        if (ref?.current) {
            ref.current.addEventListener('change', onChange)
        }
    }, [ref]);

    return {
        value,
    }
}

export {
    Selector
}
