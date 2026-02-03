import React, {useState} from 'react'

import Card from '../../shared/components/UIElements/Card'
import Button from '../../shared/components/FormElements/Button'
import Input from '../../shared/components/FormElements/Input'
import './Auth.css'
import { VALIDATOR_EMAIL, VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../../shared/util/validators'
import { useForm } from '../../shared/hooks/form-hook'

const Auth =() => {
    const [isLoginMode, setIsLoginMode] = useState(true)

    const [formState, inputHandler, setFormData] = useForm({
        email: {
            value: '',
            isValid: false
        },
        password: {
            value: '',
            isValid: false
        }
    }, false )

    const switchModeHandler = () => {
        if (!isLoginMode) {
            setFormData({
                name: undefined
            }, formState.inputs.email.isValid && formState.inputs.password.isValid)
        }
        else {
            setFormData({
                ...formState.inputs,
                name: {
                    value: '',
                    isValid: false
                }
            }, false)
        }
        setIsLoginMode(prevMode => !prevMode)
    }

    const authSubmitHandler = event => {
        event.preventDefault()
        console.log(formState.inputs);
    }
  return (
    <Card className="authentication">
        <h2>Login Required</h2>
        <hr />
        <form onSubmit={authSubmitHandler}>
            {!isLoginMode && 
                <Input 
                    element="input"
                    id="name"
                    type="text"
                    label="Your Name"
                    validators={[VALIDATOR_REQUIRE]}
                    errorText="Enter your name."
                    onInput={inputHandler}
                />
            }
            <Input 
                element="input"
                id="email"
                type="email"
                label="E-mail"
                validators={[VALIDATOR_EMAIL()]}
                errorText="Enter a valid email address."
                onInput={inputHandler}
            />
            <Input 
                element="input"
                id="password"
                type="password"
                label="Password"
                validators={[VALIDATOR_MINLENGTH(8)]}
                errorText="Enter a valid password (at least 8 characters)"
                onInput={inputHandler}
            />
            <Button type="submit" disabled={!formState.isValid}>
                {isLoginMode ? 'LOGIN' : 'SIGNUP'} 
            </Button>
        </form>
        <Button inverse onClick={switchModeHandler}> 
            New to TOURISM? {isLoginMode ? 'SIGNUP' : 'LOGIN'} 
        </Button>
    </Card>
  )
}

export default Auth