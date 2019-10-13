import { LayerExtension } from "deck.gl";
// import {GL} from 'luma.gl';

export class InjectionExtension extends LayerExtension {
    getShaders(extension) {
        return {
            inject: {
                'vs:#decl':`
                attribute float injection;
                `,
                'vs:DECKGL_FILTER_COLOR':`
                if (injection == 1.0) {
                    color = vec4(1.0, 0.0, 0.0, color.a);
                } else {
                    color = vec4(0.0 ,0.0 ,1.0 ,color.a);
                }
                `,
            }
        }
    }

    initializeState(context, extension) {
        this.getAttributeManager().addInstanced({
            injection: {
              size: 1,
              accessor: 'getInjection',
              defaultValue: 0,
            },
        });
    }

    // updateState(params, extension) {
    //     const {primaryColor = [255,0,0,255], secondaryColor = [0,0,255,255]} = params.props;
    //     for (const model of this.getModels()) {
    //         model.setUniforms({primaryColor, secondaryColor});
    //     }
    // }
}