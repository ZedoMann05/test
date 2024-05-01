import * as React from 'react';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {useTheme} from '@mui/material/styles';

export interface CustomSelectProps {
    handleChange: (type: string) => void;
    value: string;
    items: string[];
    disabled?: boolean;
}

export function CustomSelect({handleChange, value, items, disabled}: CustomSelectProps) {
    const theme = useTheme();

    return (
        <div>
            <FormControl sx={{ml: 1, minWidth: 80}}>
                <Select
                    sx={{
                        border: 'none',
                        borderRadius: '40px',
                        background: 'rgba(198, 237, 252, 1)',
                        '.MuiSelect-select': {
                            padding: '7px 5px 7px 15px',
                            fontSize: '14px',
                            color: 'rgba(16, 39, 51, 1)',
                            fontWeight: 500,
                            textTransform: 'uppercase'
                        },
                        '.MuiOutlinedInput-notchedOutline': {
                            border: 'none'
                        },
                        '.MuiSvgIcon-root': {
                            right: '10px'
                        },
                        '&:disabled': {
                            background: theme.palette.primary.contrastText
                        }
                    }}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => handleChange(e.target.value)}
                    IconComponent={KeyboardArrowDownIcon}>
                    {items.map((item) => (
                        <MenuItem key={item} value={item}>
                            {item}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
}

export default CustomSelect;
