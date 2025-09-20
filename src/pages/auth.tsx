import { useEffect, useState } from 'react'

import { Footer } from '../components/footer';
import { Config } from '../../config';

import * as Types from '../../module/types/types.ts'

import { Signin } from '../components/auth/signin.tsx';

import './style/auth.css'



type Props = {
    setErrorMessage: (message: string | null) => void
}


export const Auth = ({ setErrorMessage }: Props) => {
    const config = new Config()

    // UI


    // UX

    // Форматирование номера


    return (
        <div className='auth-body'>
            <Signin setErrorMessage={setErrorMessage}/>
        </div>
    );
};