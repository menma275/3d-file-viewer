import { atom } from 'jotai'

export const selectedFileIdAtom = atom<string | null>(null)

export const axisXAtom = atom<string>('ex')
export const axisYAtom = atom<string>('ey')
export const axisZAtom = atom<string>('ez')
