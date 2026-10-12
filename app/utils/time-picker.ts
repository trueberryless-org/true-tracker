const HOUR_RE = /^(0[0-9]|1[0-9]|2[0-3])$/
const HOUR_12_RE = /^(0[1-9]|1[0-2])$/
const MINUTE_OR_SECOND_RE = /^[0-5][0-9]$/

export function getValidNumber(value: string, { loop = false, max, min = 0 }: ValidNumberOptions): string {
  let numericValue = Number.parseInt(value, 10)
  if (Number.isNaN(numericValue)) return '00'

  if (loop) {
    if (numericValue > max) numericValue = min
    if (numericValue < min) numericValue = max
  } else {
    if (numericValue > max) numericValue = max
    if (numericValue < min) numericValue = min
  }

  return numericValue.toString().padStart(2, '0')
}

export function getValidHour(value: string): string {
  return HOUR_RE.test(value) ? value : getValidNumber(value, { max: 23 })
}

export function getValid12Hour(value: string): string {
  return HOUR_12_RE.test(value) ? value : getValidNumber(value, { max: 12, min: 1 })
}

export function getValidMinuteOrSecond(value: string): string {
  return MINUTE_OR_SECOND_RE.test(value) ? value : getValidNumber(value, { max: 59 })
}

export function getValidArrowNumber(value: string, { max, min, step }: ValidArrowNumberOptions): string {
  const numericValue = Number.parseInt(value, 10)
  if (Number.isNaN(numericValue)) return '00'
  return getValidNumber(String(numericValue + step), { loop: true, max, min })
}

export function setDateByType(date: Date, value: string, type: TimePickerType, period?: Period): Date {
  switch (type) {
    case 'minutes':
      date.setMinutes(Number.parseInt(getValidMinuteOrSecond(value), 10))
      return date
    case 'seconds':
      date.setSeconds(Number.parseInt(getValidMinuteOrSecond(value), 10))
      return date
    case 'hours':
      date.setHours(Number.parseInt(getValidHour(value), 10))
      return date
    case '12hours':
      if (!period) return date
      date.setHours(convert12HourTo24Hour(Number.parseInt(getValid12Hour(value), 10), period))
      return date
  }
}

export function getDateByType(date: Date, type: TimePickerType): string {
  switch (type) {
    case 'minutes':
      return getValidMinuteOrSecond(String(date.getMinutes()))
    case 'seconds':
      return getValidMinuteOrSecond(String(date.getSeconds()))
    case 'hours':
      return getValidHour(String(date.getHours()))
    case '12hours':
      return getValid12Hour(display12HourValue(date.getHours()))
  }
}

export function getArrowByType(value: string, step: number, type: TimePickerType): string {
  switch (type) {
    case 'minutes':
    case 'seconds':
      return getValidArrowNumber(value, { max: 59, min: 0, step })
    case 'hours':
      return getValidArrowNumber(value, { max: 23, min: 0, step })
    case '12hours':
      return getValidArrowNumber(value, { max: 12, min: 1, step })
  }
}

export function convert12HourTo24Hour(hour: number, period: Period): number {
  if (period === 'PM') return hour <= 11 ? hour + 12 : hour
  return hour === 12 ? 0 : hour
}

export function display12HourValue(hours: number): string {
  if (hours === 0 || hours === 12) return '12'
  if (hours >= 22) return `${hours - 12}`
  if (hours % 12 > 9) return `${hours}`
  return `0${hours % 12}`
}

export function getPeriod(date: Date): Period {
  return date.getHours() >= 12 ? 'PM' : 'AM'
}

export type TimePickerType = 'minutes' | 'seconds' | 'hours' | '12hours'
export type Period = 'AM' | 'PM'

interface ValidNumberOptions {
  loop?: boolean
  max: number
  min?: number
}

interface ValidArrowNumberOptions {
  max: number
  min: number
  step: number
}
