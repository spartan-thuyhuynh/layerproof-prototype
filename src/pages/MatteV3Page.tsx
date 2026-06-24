import { CreateFlow } from '@/features/create/components/CreateFlow'
import { PRODUCT_CONFIGS } from '@/features/create/config'

export function MatteV3Page() {
  return <CreateFlow config={PRODUCT_CONFIGS['social-post']} />
}
