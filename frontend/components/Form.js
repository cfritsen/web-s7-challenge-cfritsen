import React, { useEffect, useState } from 'react'
import * as yup from 'yup'
import axios from 'axios'

// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L'
}

// 👇 Here you will create your schema.
const formSchema = yup.object().shape({
  fullName: yup.string().min(3, validationErrors.fullNameTooShort).max(20, validationErrors.fullNameTooLong).required(),
  size: yup.string().oneOf(['S', 'M', 'L'], validationErrors.sizeIncorrect).required(),
  toppings: yup.array().of(yup.lazy(value => typeof value === 'number' ? yup.number().oneOf([1,2,3,4,5]) : yup.string().oneOf(['1','2','3','4','5']))).max(5)
})

// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
]

export default function Form() {
  //States for Form Control
  const [form, setForm] = useState({
    fullName: '',
    size: '',
    toppings: []
  })
  const [errors, setErrors] = useState({
    fullName: '',
    size: ''
  })
  const [success, setSuccess] = useState('')
  const [failure, setFailure] = useState('')
  const [disableSubmit, setDisableSubmit] = useState(true)

  //Effect for validation on form update
  useEffect(() => {
    formSchema.isValid(form).then(isValid => {
      setDisableSubmit(!isValid)
    })
  },[form])

  //Updates and validates form dynamically
  const changeHandler = evt => {
    const {type, value, id, checked} = evt.target;

    if (type === 'checkbox'){
      if (checked){
        setForm({...form, toppings: [...form.toppings, value]})
      } else {setForm({...form, toppings: form.toppings.filter(num => num !== value)})}
    }
    else setForm({...form, [id]: value})

    yup.reach(formSchema, id).validate(value)
      .then(() => {
        setErrors({...errors, [id]: ''})
      })
      .catch((err) => {
        setErrors({...errors, [id]: err.errors[0]})
      })
  }

  //Validation on form Submit
  const submitHandler = evt => {
    evt.preventDefault();
    setDisableSubmit(true)

    formSchema.isValid(form).then(() => {
      axios.post('http://localhost:9009/api/order', form)
        .then(result => {
          setSuccess(result.data.message)
          setFailure('')
          setForm({
            fullName: '',
            size: '',
            toppings: []
          })
        })
        .catch(err => {
          setSuccess('')
          setFailure(err.data.message)
        })
    })
  }


  return (
    <form onChange={changeHandler} onSubmit={submitHandler}>
      <h2>Order Your Pizza</h2>
      {success && <div className='success'>{success}</div>}
      {failure && <div className='failure'>{failure}</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label><br />
          <input placeholder="Type full name" id="fullName" type="text" onChange={() => {}}value={form.fullName} />
        </div>
        {true && <div className='error'>{errors.fullName}</div>}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label><br />
          <select id="size" readOnly={true} value={form.size}>
            <option value="">----Choose Size----</option>
            {/* Fill out the missing options */}
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
          </select>
        </div>
        {true && <div className='error'>{errors.size}</div>}
      </div>

      <div className="input-group">
        {/* 👇 Maybe you could generate the checkboxes dynamically */}
        {toppings.map(topping => {return(
        <label key={topping.topping_id}>
          <input
            name={topping.text}
            type="checkbox"
            readOnly={true}
            value={topping.topping_id}
            checked={form.toppings.includes(topping.topping_id)}
          />{topping.text}
        </label>)})}
      </div>
      {/* 👇 Make sure the submit stays disabled until the form validates! */}
      <input type="submit" disabled={disableSubmit} />
    </form>
  )
}
