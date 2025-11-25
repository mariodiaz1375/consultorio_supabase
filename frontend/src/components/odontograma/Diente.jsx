import React, { useEffect, useReducer, useRef } from 'react';
import useContextMenu from 'contextmenu';
import 'contextmenu/ContextMenu.css';
import styles from './Diente.module.css';

function Tooth({ number, positionX, positionY, onChange, externalState }) {
    const initialState = {
        Cavities: {
            center: 0,
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        },
        Extract: 0,
        Crown: 0,
        Filter: 0,
        Fracture: 0,
        Conducto: 0
    };

    function reducer(toothState, action) {
        switch (action.type) {
            case 'crown':
                return { ...toothState, Crown: action.value };
            case 'extract':
                return { ...toothState, Extract: action.value };
            case 'filter':
                return { ...toothState, Filter: action.value };
            case 'fracture':
                return { ...toothState, Fracture: action.value };
            case 'carie':
                return { ...toothState, Cavities: setCavities(toothState, action.zone, action.value) };
            case 'conducto':
                return { ...toothState, Conducto: action.value };
            case 'clear':
                return initialState;
            default:
                throw new Error();
        }
    }

    const crown = (val) => ({ type: "crown", value: val });
    const extract = (val) => ({ type: "extract", value: val });
    const filter = (val) => ({ type: "filter", value: val });
    const fracture = (val) => ({ type: "fracture", value: val });
    const conducto = (val) => ({ type: "conducto", value: val });
    const carie = (z, val) => ({ type: "carie", value: val, zone: z });
    const clear = () => ({ type: "clear" });

    const [toothState, dispatch] = useReducer(reducer, initialState);
    const [contextMenu, useCM] = useContextMenu({ submenuSymbol: '>' });

    useEffect(() => {
        if (externalState) {
            // Aquí forzamos el estado visual basado en lo que calculamos en el mapper
            // Esto es un poco truco, lo ideal sería que el reducer acepte una acción 'SET_FULL_STATE'
            // Pero por ahora, podemos simularlo o modificar el reducer:
            if (externalState.Extract) dispatch(extract(externalState.Extract));
            if (externalState.Crown) dispatch(crown(externalState.Crown));
            if (externalState.Conducto) dispatch(conducto(externalState.Conducto));
            if (externalState.Cavities) {
                Object.keys(externalState.Cavities).forEach(zona => {
                    if(externalState.Cavities[zona] > 0) {
                        dispatch(carie(zona, externalState.Cavities[zona]));
                    }
                });
            }
        }
    }, [externalState]);

    const firstUpdate = useRef(true);
    useEffect(() => {
        if (firstUpdate.current) {
            firstUpdate.current = false;
            return;
        }
        onChange(number, toothState);
    }, [toothState, onChange, number]);

    // Done SubMenu
    const doneSubMenu = (place, value) => {
        return {
            'Cavity': () => {
                dispatch(carie(place, value));
            },
            'Cavities All': () => dispatch(carie('all', value)),
            'Absent': () => dispatch(extract(value)),
            'Crown': () => dispatch(crown(value)),
            'Root Canal': () => dispatch(conducto(value)),
        }
    }

    // Todo SubMenu
    const todoSubMenu = (place, value) => {
        return {
            'Cavity': () => dispatch(carie(place, value)),
            'Cavities All': () => dispatch(carie('all', value)),
            'Absent': () => dispatch(extract(value)),
            'Crown': () => dispatch(crown(value)),
            'Filtered Out': () => dispatch(filter(value)),
            'Fractured': () => dispatch(fracture(value)),
            'Root Canal': () => dispatch(conducto(value)),
        }
    }

    // Main ContextMenu
    const menuConfig = (place) => {
        return {
            'Done': doneSubMenu(place, 1),
            'To Do': todoSubMenu(place, 2),
            'JSX line': <hr></hr>,
            'Clear All': () => dispatch(clear()),
        }
    };

    let getClassNamesByZone = (zone) => {
        if (toothState.Cavities) {
            if (toothState.Cavities[zone] === 1) {
                return 'to-do';
            } else if (toothState.Cavities[zone] === 2) {
                return 'done';
            }
        }

        return '';
    }

    // Tooth position
    const translate = `translate(${positionX},${positionY})`;

    return (
        <svg className={styles.tooth}>
            <g transform={translate}>
                <polygon
                    points="0,0 20,0 15,5 5,5"
                    // onContextMenu={useCM(menuConfig('top'))}
                    className={styles[getClassNamesByZone('top')]}
                >
                    {((number >= 11 && number <= 28) || (number >= 51 && number <= 65)) ? 
                    (<title>Vestibular</title>) : (<title>Lingual</title>)}
                </polygon>
                <polygon
                    points="5,15 15,15 20,20 0,20"
                    // onContextMenu={useCM(menuConfig('top'))}
                    className={styles[getClassNamesByZone('bottom')]} // Corregido
                >
                    {((number >= 11 && number <= 28) || (number >= 51 && number <= 65)) ? 
                    (<title>Lingual</title>) : (<title>Vestibular</title>)}
                </polygon>
                <polygon
                    points="15,5 20,0 20,20 15,15"
                    // onContextMenu={useCM(menuConfig('top'))}
                    className={styles[getClassNamesByZone('left')]} // Corregido
                >
                    {((number >= 11 && number <= 18) || (number >= 41 && number <= 48)
                    || (number >= 51 && number <= 55) || (number >= 81 && number <= 85)) ? 
                    (<title>Mesial</title>) : (<title>Distal</title>)}
                </polygon>
                <polygon
                    points="0,0 5,5 5,15 0,20"
                    // onContextMenu={useCM(menuConfig('top'))}
                    className={styles[getClassNamesByZone('right')]} // Corregido
                >
                    {((number >= 11 && number <= 18) || (number >= 41 && number <= 48)
                    || (number >= 51 && number <= 55) || (number >= 81 && number <= 85)) ? 
                    (<title>Distal</title>) : (<title>Mesial</title>)}
                </polygon>
                <polygon
                    points="5,5 15,5 15,15 5,15"
                    // onContextMenu={useCM(menuConfig('top'))}
                    className={styles[getClassNamesByZone('center')]} // Corregido
                >
                    <title>Oclusal / Incisal</title>
                </polygon>
                {drawToothActions()}
                <text
                    x="6"
                    y="30"
                    stroke="navy"
                    fill="navy"
                    strokeWidth="0.1"
                    className={styles.tooth}>
                    {number}
                </text>
            </g>
            {contextMenu}
        </svg>
    )

    function setCavities(prevState, zone, value) {
        if (prevState && prevState.Cavities) {
            if (zone === "all") {
                prevState.Cavities =
                {
                    center: value,
                    top: value,
                    bottom: value,
                    left: value,
                    right: value
                }
            } else {
                prevState.Cavities[zone] = value;
            }

            return prevState.Cavities;
        }
    }

    function drawToothActions() {
        let otherFigures = null;
        if (toothState.Extract > 0) {
            otherFigures = <g stroke={toothState.Extract === 1 ? "blue" : "red"}>
                <line x1="0" y1="0" x2="20" y2="20" strokeWidth="2" />
                <line x1="0" y1="20" x2="20" y2="0" strokeWidth="2" />
            </g>
        }

        if (toothState.Fracture > 0) {
            otherFigures = <g stroke={toothState.Fracture === 1 ? "blue" : "red"}>
                <line x1="0" y1="10" x2="20" y2="10" strokeWidth="2"></line>
            </g>
        }

        if (toothState.Filter > 0) {
            otherFigures = <g stroke={toothState.Fracture === 1 ? "blue" : "red"}>
                <line x1="0" y1="20" x2="20" y2="0" strokeWidth="2" />
            </g>
        }

        if (toothState.Crown > 0) {
            otherFigures = <circle
                cx="10"
                cy="10"
                r="10"
                fill="none"
                stroke={toothState.Crown === 1 ? "blue" : "red"}
                strokeWidth="2"
            />;
        }
        if (toothState.Conducto > 0) {
            otherFigures = <g stroke={toothState.Conducto === 1 ? "blue" : "red"}>
                <line x1="7" y1="0" x2="7" y2="20" strokeWidth="1.5" />
                <line x1="13" y1="0" x2="13" y2="20" strokeWidth="1.5" />
            </g>
        }

        return otherFigures;
    }
}

export default Tooth;