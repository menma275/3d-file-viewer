import { PCA } from 'ml-pca'

const reduceTo3D = (data: number[][]): number[][] => {
    const pca = new PCA(data)
    const result = pca.predict(data, { nComponents: 3 })
    return result.to2DArray()
}

export default reduceTo3D
