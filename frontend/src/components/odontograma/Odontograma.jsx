import React from 'react';
import styles from './Odontograma.module.css';
import Teeth from './Dientes';

function Odontogram() {

  let odontogramState = {};

  const handleToothUpdate = (id, toothState) => {
    odontogramState[id] = toothState;
  };

  return (
    <div className={styles.Odontogram}>
      <svg 
        version="1.1" 
        height="100%" 
        width="100%" 
        /* 👇 AJUSTE FINAL: Reducimos el ancho de 760 a 730 para quitar el espacio vacío */
        viewBox="0 0 750 300" 
        preserveAspectRatio="xMidYMid meet"
      >
        {/* 1. Adultos Superiores */}
        <Teeth start={18} end={11} x={0} y={0} handleChange={handleToothUpdate} />
        <Teeth start={21} end={28} x={210} y={0} handleChange={handleToothUpdate} />

        {/* 2. Adultos Inferiores */}
        <Teeth start={48} end={41} x={0} y={40} handleChange={handleToothUpdate} />
        <Teeth start={31} end={38} x={210} y={40} handleChange={handleToothUpdate} />

        {/* 3. Niños Superiores */}
        <Teeth start={55} end={51} x={75} y={80} handleChange={handleToothUpdate} />
        <Teeth start={61} end={65} x={210} y={80} handleChange={handleToothUpdate} />

        {/* 4. Niños Inferiores */}
        <Teeth start={85} end={81} x={75} y={120} handleChange={handleToothUpdate} />
        <Teeth start={71} end={75} x={210} y={120} handleChange={handleToothUpdate} />

      </svg>
    </div>
  );
}

export default Odontogram;