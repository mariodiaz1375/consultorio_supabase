import React, { useEffect, useState } from 'react'
import PersonalCard from '../personalCard/PersonalCard'
import { getPersonal } from '../../api/personal.api'
import styles from './PersonalList.module.css'

export default function PersonalList() {
  const [personal, setPersonal] = useState([])

  useEffect(() => {
    const fetchPersonal = async () => {
      const data = await getPersonal()
      console.log(data)
      setPersonal(data)
    }
    fetchPersonal()
  }, [])

  return (
    <div>
      <div className={styles['encabezado']}>
        <h1 className={styles.title}>Lista de Personal</h1>
        <div className={styles['boton-conteiner']}>
          <button className={styles['register-button']}>Registrar Miembro</button>
        </div>
      </div>
      <div>
        {personal.map(miembro => (
          <PersonalCard key={miembro.id} miembro={miembro}/>
        ))}
      </div>
    </div>
  );
}