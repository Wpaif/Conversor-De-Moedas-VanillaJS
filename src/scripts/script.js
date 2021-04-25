const currencyOneEl = document.querySelector('[data-js="currency-one"]')
const currencyTwoEl = document.querySelector('[data-js="currency-two"]')
const currenciesEl = document.querySelector('[data-js="currencies-container"]')
const convertedValueEl = document.querySelector('[data-js="converted-value"]')
const valuePrecisionEl = document.querySelector('[data-js="conversion-precision"]')
const timesCurrencyOneEl = document.querySelector(['[data-js="currency-one-times"]'])




const showAlert = err => {
  const div = document.createElement('div')
  const p = document.createElement('p')
  const button = document.createElement('button')

  div.classList.add('error-container')

  p.textContent = err.message
  p.classList.add('error-text')

  button.textContent = 'X'
  button.classList.add('error-button')

  const removeAlert = () => div.remove()
  button.addEventListener('click', removeAlert)

  div.appendChild(p)
  div.appendChild(button)
  currenciesEl.insertAdjacentElement('afterend', div)
}

const state = (() => {
  let exchangeRate = {}
  return {
    getExchangeRate: () => exchangeRate,
    setExchangeRate: newExchangeRate => {
      if (!newExchangeRate.conversion_rates) {
        showAlert({ 
          message: 'O objero precisa ter uma propiedade conversion_rates' 
        })
        return
      }
      exchangeRate = newExchangeRate
      return exchangeRate
    }
  }
})()
const APIKey = '1c14ac96aaf83b4a04951d98'
const getUrl = currency => 
  `https://v6.exchangerate-api.com/v6/${APIKey}/latest/${currency}`

const getErrorMessage = errorType => ({
  'unsupported-code': 'A moeda não existe no nosso banco de dados',
  'malformed-request':'O ending point do seu request precisa seguir a estrutura: "https://v6 exchangerate-api.com/v6/ API-KEY / latest / sigla"',
  'invalid-key': 'Chave da API inválida',
  'inactive-account': 'Seu endereço de email não foi confirmado',
  'quota-reached': 'Número de requests máximo do seu plano foi atingido'
})[errorType] || 'Não foi possível obter as informações'

const fetchExchangeRate = async url => {
  try {
    const reponse = await fetch(url)

    if (!reponse.ok)
      throw new Error('Sua conecção falhou. Não foi possível obter as informações.')

    const exchangeRateData = await reponse.json()

    internalExchangeData = { ...exchangeRateData }

    if (exchangeRateData.result === 'error') {
      const errorMessage = getErrorMessage(exchangeRateData['error-type'])
      throw new Error(errorMessage)
    }
    return state.setExchangeRate(exchangeRateData)
  } catch (err) {
    showAlert(err)
  }
}

const getOptions = (selectedCurrecy, conversion_rates) => {
  const allRates = Object.keys(conversion_rates)
  const setSelectedAttribute = (currency) =>
    currency === selectedCurrecy ? 'selected' : ''

  const getOptionsAsArray = currency =>
    `<option ${setSelectedAttribute(currency)}>${currency}</option>`

  return allRates.map(getOptionsAsArray).join('')

}

const getMultipliedExchangeRate = conversion_rates => {
  const currencyTwo = conversion_rates[currencyTwoEl.value]
  return (currencyTwo * Number(timesCurrencyOneEl.value)).toFixed(2)
}

const getNotRoudedExchangeRate = conversion_rates => {
  const currencyTwo = conversion_rates[currencyTwoEl.value]
  return `1 ${currencyOneEl.value} = ${currencyTwo} ${currencyTwoEl.value}`
}

const showInitialInfo = ({ conversion_rates }) => {
  currencyOneEl.innerHTML = getOptions('USD', conversion_rates)
  currencyTwoEl.innerHTML = getOptions('BRL', conversion_rates)

  showUpadateRate({ conversion_rates })
}

const init = async () => {
  const url = getUrl('USD')
  const exchangeRate = await fetchExchangeRate(url)

  if (exchangeRate && exchangeRate.conversion_rates)
    showInitialInfo(exchangeRate)
}

const showUpadateRate = ({ conversion_rates }) => {
  convertedValueEl.textContent = getMultipliedExchangeRate(conversion_rates)
  valuePrecisionEl.textContent = getNotRoudedExchangeRate(conversion_rates)
}

const handleTimesCurrencyOneElInput = () => {
  const { conversion_rates } = state.getExchangeRate()
  convertedValueEl.textContent = getMultipliedExchangeRate(conversion_rates)
}

const handleCurrencyTwoElInput = () => {
  const exchangeRate = state.getExchangeRate()
  showUpadateRate(exchangeRate)
}

const handleCurrencOneElInput = async () => {
  const url = getUrl(currencyOneEl.value)
  const exchangeRate = await fetchExchangeRate(url)
  showUpadateRate(exchangeRate)
}

timesCurrencyOneEl.addEventListener('input', handleTimesCurrencyOneElInput)
currencyTwoEl.addEventListener('input', handleCurrencyTwoElInput)
currencyOneEl.addEventListener('input', handleCurrencOneElInput)
window.addEventListener('DOMContentLoaded', init)

