import { Suspense } from 'react'
import ArticlesContent from './ArticlesContent'

export default function ArticlesPage() {
   return (
      <Suspense fallback={<div>Loading...</div>}>
         <ArticlesContent />
      </Suspense>
   )
}