export default class FtueScreen extends Component {
    constructor(props) {
      super(props);
      this.state = {
        modalVisible: false
      };
    }
      render() {
      return (
        <View>
          <Modal
            animationType={"slide"}
            transparent={true}
            style={styles.ftreContainer}
            visible={this.state.modalVisible}
            onRequestClose={() => {
              alert("Wyłączyłeś to!");
            }}
          >
            <View style={styles.ftreContainer}>
              <View style={styles.ftreTitleContainer}>
                <Text style={styles.ftreTitle}>{this.props.title}</Text>
              </View>
              <View style={styles.ftreDescriptionContainer}>
                <Text style={styles.ftreDescription} allowFontScaling={true}>
                  {this.props.description}
                </Text>
              </View>
              <View style={styles.ftreExitContainer}>
                <TouchableHighlight
                  onPress={() => {
                    this.setModalVisible(!this.state.modalVisible);
                  }}
                >
                  <View style={styles.ftreExitButtonContainer}>
                    <Text style={styles.ftreExitButtonText}>Exit</Text>
                  </View>
                </TouchableHighlight>
              </View>
            </View>
          </Modal>
        </View>
      );
    }
  }