import { ReactComponent as UserIcon } from './assets/icons/user-solid-full.svg'
import { ReactComponent as UserCheckIcon } from './assets/icons/user-check-solid-full.svg'
import { ReactComponent as ClockIcon } from './assets/icons/clock-solid-full.svg'
import { ReactComponent as PromoteIcon } from './assets/icons/arrow-up-short-wide-solid-full.svg'
import { ReactComponent as ReduceIcon } from './assets/icons/arrow-down-short-wide-solid-full.svg'
import { ReactComponent as LocationIcon } from './assets/icons/location-dot-solid-full.svg'
import { ReactComponent as WarnIcon } from './assets/icons/triangle-exclamation-solid-full.svg'
import { ReactComponent as BanIcon } from './assets/icons/ban-solid-full.svg'

import * as Types from '../module/types/types.ts'


export type menuType = 'target_yourself' | 'target_coordinator' | 'target_classic' | 'for_hcrd' | 'target_yourself_hcrd'

type menuOption = {
    icon: React.FC<React.SVGProps<SVGSVGElement>>,
    name: string,
    color: string,
    function: (e: any) => any,
}


export class menuConfig {
    constructor (functions: (object), contextMenuData: Types.contextMenuData) {
        this.functions = functions
        this.contextMenuData = contextMenuData
    }

    functions: any = {}
    contextMenuData: Types.contextMenuData | null = null

    updateContextData = (newData: Types.contextMenuData) => {
        this.contextMenuData = newData
        console.log(this.contextMenuData.isCRD === true ? 'Назначить волонтером' : 'Назначить координатором')
    }

    get options(): Record<menuType, menuOption[]> {
        return ({
            target_yourself: [
                {
                    icon: UserIcon,
                    color: '#333',
                    name: 'Профиль',
                    function: (e:any) => this.functions.handleProfile(e)
                },
                {
                    icon: LocationIcon,
                    color: '#333',
                    name: 'Назначить позицию',
                    function: (e:any) => this.functions.handleProfile(e) // Не работает
                },
            ],
                    target_coordinator: [
            {
                icon: UserIcon,
                color: '#333',
                name: 'Профиль',
                function: (e:any) => this.functions.handleProfile(e)
            },
            {
                icon: LocationIcon,
                color: '#333',
                name: 'Назначить позицию',
                function: (e:any) => this.functions.handleProfile(e) // Не работает
            },
            ],
            target_classic: [
                {
                    icon: UserIcon,
                    color: '#333',
                    name: 'Профиль',
                    function: (e:any) => this.functions.handleProfile(e)
                },
                {
                    icon: this.contextMenuData?.visit ? BanIcon : UserCheckIcon,
                    color: '#333',
                    name: this.contextMenuData?.visit ? 'Отметить отсутствие' : 'Отметить посещение',
                    function: (e:any) => this.functions.handleVisit(e)
                },
                {
                    icon: this.contextMenuData?.late ? BanIcon : ClockIcon,
                    color: '#333',
                    name: this.contextMenuData?.late ? 'Отменить опоздание' : 'Отметить опоздание',
                    function: (e:any) => this.functions.handleLate(e)
                },
                {
                    icon: LocationIcon,
                    color: '#333',
                    name: 'Назначить позицию',
                    function: (e:any) => this.functions.handleProfile(e) // Не работает
                },
                {
                    icon: !this.contextMenuData?.warn ? WarnIcon : BanIcon,
                    color: '#C0392B',
                    name: !this.contextMenuData?.warn ? 'Предупреждение' : !this.contextMenuData?.bl ? 'Отправить в ЧС' : 'Удалить из ЧС',
                    function: (e:any) => this.functions.handleWarn(e)
                },
            ],
            for_hcrd: [
                {
                    icon: UserIcon,
                    color: '#333',
                    name: 'Профиль',
                    function: (e:any) => this.functions.handleProfile(e)
                },
                {
                    icon: this.contextMenuData?.visit ? BanIcon : UserCheckIcon,
                    color: '#333',
                    name: this.contextMenuData?.visit ? 'Отметить отсутствие' : 'Отметить посещение',
                    function: (e:any) => this.functions.handleVisit(e)
                },
                {
                    icon: this.contextMenuData?.late ? BanIcon : ClockIcon,
                    color: '#333',
                    name: this.contextMenuData?.late ? 'Отменить опоздание' : 'Отметить опоздание',
                    function: (e:any) => this.functions.handleLate(e)
                },
                {
                    icon: this.contextMenuData?.isCRD ? ReduceIcon : PromoteIcon,
                    color: '#333',
                    name: this.contextMenuData?.isCRD ? 'Назначить волонтёром' : 'Назначить координатором',
                    function: (e:any) => this.functions.changeCRD(e)
                },
                {
                    icon: LocationIcon,
                    color: '#333',
                    name: 'Назначить позицию',
                    function: (e:any) => this.functions.handleProfile(e) // Не работает
                },
                {
                    icon: !this.contextMenuData?.warn ? WarnIcon : BanIcon,
                    color: '#C0392B',
                    name: !this.contextMenuData?.warn ? 'Предупреждение' : !this.contextMenuData?.bl ? 'Отправить в ЧС' : 'Удалить из ЧС',
                    function: (e:any) => this.functions.handleWarn(e)
                },
            ],
            target_yourself_hcrd: [
                {
                    icon: UserIcon,
                    color: '#333',
                    name: 'Профиль',
                    function: (e:any) => this.functions.handleProfile(e)
                },
                {
                    icon: this.contextMenuData?.visit ? BanIcon : UserCheckIcon,
                    color: '#333',
                    name: this.contextMenuData?.visit ? 'Отметить отсутствие' : 'Отметить посещение',
                    function: (e:any) => this.functions.handleVisit(e)
                },
                {
                    icon: this.contextMenuData?.late ? BanIcon : ClockIcon,
                    color: '#333',
                    name: this.contextMenuData?.late ? 'Отменить опоздание' : 'Отметить опоздание',
                    function: (e:any) => this.functions.handleLate(e)
                },
                {
                    icon: LocationIcon,
                    color: '#333',
                    name: 'Назначить позицию',
                    function: (e:any) => this.functions.handleProfile(e) // Не работает
                },
            ]
        })
    }
}

