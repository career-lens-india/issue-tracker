/**
 * Instructor-led mini-demo for Unit III: React class components.
 * SprintBoard uses functional components; this file is a separate teaching example.
 */
import React from 'react';

export default class ClassGreetingDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = { clicks: 0 };
  }

  handleClick = () => {
    this.setState((prev) => ({ clicks: prev.clicks + 1 }));
  };

  render() {
    const { name } = this.props;
    return (
      <section>
        <h2>Hello, {name}</h2>
        <p>Clicks: {this.state.clicks}</p>
        <button type="button" onClick={this.handleClick}>Greet again</button>
      </section>
    );
  }
}
