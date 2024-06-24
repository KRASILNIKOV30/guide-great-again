import React from 'react'
import './Sidebar.css'
import {Selector} from "../selector/Selector";

type SidebarProps = {
    onWaterChange: (n: number) => void,
    onForestChange: (n: number) => void,
    onScrubChange: (n: number) => void,
    onSandChange: (n: number) => void,
}

const Sidebar = ({
    onWaterChange,
    onForestChange,
    onScrubChange,
    onSandChange,
}: SidebarProps) => (
    <div className="sidebar__container">
        <Selector
            title="Вода"
            onChange={onWaterChange}
            defaultValue={0}
        />
        <Selector
            title="Лес"
            onChange={onForestChange}
            defaultValue={5}
        />
        <Selector
            title="Кусты"
            onChange={onScrubChange}
            defaultValue={10}
        />
        <Selector
            title="Песок"
            onChange={onSandChange}
            defaultValue={20}
        />
    </div>
)

export {Sidebar}
